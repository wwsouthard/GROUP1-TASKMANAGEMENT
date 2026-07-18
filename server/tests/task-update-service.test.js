/**
 * Update Task service/persistence tests
 * Uses Jest + Supertest against the Express `app` (same pattern as task.test.js).
 * Task model methods are mocked so the real updateTask service logic runs without Atlas.
 */
const request = require('supertest');
const app = require('../app');
const Task = require('../models/task');

jest.mock('../models/task', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  VALID_STATUSES: ['Pending', 'In Progress', 'Completed'],
  VALID_PRIORITIES: ['Low', 'Medium', 'High']
}));

describe('PUT /api/tasks/:taskId (service rules)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function buildExistingTask(overrides = {}) {
    const dateCreated = new Date('2026-07-11T16:00:00.000Z');
    const task = {
      _id: '507f1f77bcf86cd799439011',
      taskId: 23,
      title: 'Original title',
      description: 'Original description',
      status: 'Pending',
      priority: 'Low',
      dueDate: null,
      dateCreated,
      dateModified: new Date('2026-07-11T16:00:00.000Z'),
      projectId: 1000,
      save: jest.fn(),
      ...overrides
    };

    task.save.mockImplementation(async function saveTask() {
      return this;
    });

    return task;
  }

  it('should update editable fields, refresh dateModified, and preserve taskId and dateCreated', async () => {
    const existingTask = buildExistingTask();
    const originalDateCreated = existingTask.dateCreated;
    const originalDateModified = existingTask.dateModified;

    Task.findOne
      .mockResolvedValueOnce(existingTask)
      .mockResolvedValueOnce(null);

    const response = await request(app).put('/api/tasks/23').send({
      title: 'Updated title',
      description: 'Updated description',
      status: 'In Progress',
      priority: 'High',
      projectId: 1000,
      dueDate: '2026-07-25'
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task updated successfully');
    expect(response.body.task.taskId).toBe(23);
    expect(response.body.task.dateCreated).toEqual(originalDateCreated.toISOString());
    expect(response.body.task.title).toBe('Updated title');
    expect(response.body.task.status).toBe('In Progress');
    expect(response.body.task.priority).toBe('High');
    expect(new Date(response.body.task.dateModified).getTime()).toBeGreaterThan(
      originalDateModified.getTime()
    );
    expect(Task.findOne).toHaveBeenNthCalledWith(1, { taskId: 23 });
    expect(Task.findOne).toHaveBeenNthCalledWith(2, {
      title: 'Updated title',
      taskId: { $ne: 23 }
    });
    expect(existingTask.save).toHaveBeenCalledTimes(1);
    expect(existingTask.taskId).toBe(23);
    expect(existingTask.dateCreated).toBe(originalDateCreated);
  });

  it('should allow keeping the same title on the task being updated', async () => {
    const existingTask = buildExistingTask({ title: 'Keep this title' });

    Task.findOne
      .mockResolvedValueOnce(existingTask)
      .mockResolvedValueOnce(null);

    const response = await request(app).put('/api/tasks/23').send({
      title: 'Keep this title',
      status: 'Pending',
      priority: 'Low',
      projectId: 1000
    });

    expect(response.status).toBe(200);
    expect(response.body.task.title).toBe('Keep this title');
    expect(Task.findOne).toHaveBeenNthCalledWith(2, {
      title: 'Keep this title',
      taskId: { $ne: 23 }
    });
    expect(existingTask.save).toHaveBeenCalledTimes(1);
  });

  it('should reject a duplicate title used by another task', async () => {
    const existingTask = buildExistingTask();

    Task.findOne
      .mockResolvedValueOnce(existingTask)
      .mockResolvedValueOnce({
        _id: '507f1f77bcf86cd799439099',
        taskId: 99,
        title: 'Design login screen'
      });

    const response = await request(app).put('/api/tasks/23').send({
      title: 'Design login screen',
      status: 'Pending',
      priority: 'Medium',
      projectId: 1000
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('A task with this title already exists');
    expect(existingTask.save).not.toHaveBeenCalled();
  });

  it('should reject an invalid status before persistence', async () => {
    const response = await request(app).put('/api/tasks/23').send({
      title: 'Updated title',
      status: 'Nope',
      priority: 'High',
      projectId: 1000
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('status must be Pending, In Progress, or Completed');
    expect(Task.findOne).not.toHaveBeenCalled();
  });

  it('should return 404 when no task matches the numeric taskId', async () => {
    Task.findOne.mockResolvedValueOnce(null);

    const response = await request(app).put('/api/tasks/23').send({
      title: 'Updated title',
      status: 'Pending',
      priority: 'Low',
      projectId: 1000
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Task not found');
    expect(Task.findOne).toHaveBeenCalledWith({ taskId: 23 });
  });
});
