/**
 * Update Task API tests
 * Uses Jest + Supertest against the Express `app` (same pattern as task-list.test.js).
 * Task service methods are mocked so tests stay isolated and do not touch Atlas.
 */
const request = require('supertest');
const taskService = require('../services/task');
const app = require('../app');

jest.mock('../services/task', () => ({
  createTask: jest.fn(),
  getTask: jest.fn(),
  listTasks: jest.fn(),
  updateTask: jest.fn(),
  validateCreateTaskInput: jest.fn()
}));

describe('PUT /api/tasks/:taskId', () => {
  // Reset mocks between tests so cases do not depend on execution order
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: valid taskId + body updates a task and returns 200 + standard success body
  it('should update a task and return 200 with the updated task', async () => {
    const requestBody = {
      title: 'Updated sprint documentation',
      description: 'Revised notes for Sprint 2',
      status: 'In Progress',
      priority: 'High',
      projectId: 1000,
      dueDate: '2026-07-25T00:00:00.000Z'
    };

    const updatedTask = {
      _id: '507f1f77bcf86cd799439011',
      taskId: 23,
      title: requestBody.title,
      description: requestBody.description,
      status: requestBody.status,
      priority: requestBody.priority,
      projectId: requestBody.projectId,
      dueDate: new Date(requestBody.dueDate),
      dateCreated: new Date('2026-07-11T16:00:00.000Z'),
      dateModified: new Date('2026-07-18T14:45:00.000Z')
    };

    taskService.updateTask.mockResolvedValue(updatedTask);

    const response = await request(app).put('/api/tasks/23').send(requestBody);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task updated successfully');
    expect(response.body.task).toMatchObject({
      taskId: 23,
      title: requestBody.title,
      description: requestBody.description,
      status: requestBody.status,
      priority: requestBody.priority,
      projectId: requestBody.projectId
    });
    expect(response.body.task.taskId).toBe(23);
    expect(response.body.task.dateModified).toBe(updatedTask.dateModified.toISOString());
    expect(taskService.updateTask).toHaveBeenCalledTimes(1);
    expect(taskService.updateTask).toHaveBeenCalledWith(23, requestBody);
  });

  // Test 2: service reports missing task → 404 with safe message and no task payload
  it('should return 404 when the task does not exist', async () => {
    const notFoundError = new Error('Task not found');
    notFoundError.statusCode = 404;
    taskService.updateTask.mockRejectedValue(notFoundError);

    const response = await request(app).put('/api/tasks/23').send({
      title: 'Updated sprint documentation',
      status: 'In Progress',
      priority: 'High',
      projectId: 1000
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Task not found');
    expect(response.body.task).toBeUndefined();
    expect(taskService.updateTask).toHaveBeenCalledWith(23, {
      title: 'Updated sprint documentation',
      status: 'In Progress',
      priority: 'High',
      projectId: 1000
    });
  });

  // Test 3: duplicate title conflict → 409 with safe message (matches create-task conflict convention)
  it('should reject a duplicate title with a client error response', async () => {
    const conflictError = new Error('A task with this title already exists');
    conflictError.statusCode = 409;
    taskService.updateTask.mockRejectedValue(conflictError);

    const response = await request(app).put('/api/tasks/23').send({
      title: 'Design login screen',
      status: 'Pending',
      priority: 'Medium',
      projectId: 1000
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('A task with this title already exists');
    expect(response.body.task).toBeUndefined();
    expect(response.body.message).not.toBe('Task updated successfully');
    expect(taskService.updateTask).toHaveBeenCalledTimes(1);
  });

  // Test 4: non-numeric route param is rejected in the controller (service never called)
  it('should return 400 when the taskId is invalid', async () => {
    const response = await request(app).put('/api/tasks/not-a-number').send({
      title: 'Updated sprint documentation',
      status: 'In Progress',
      priority: 'High',
      projectId: 1000
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid task ID');
    expect(response.body.task).toBeUndefined();
    expect(taskService.updateTask).not.toHaveBeenCalled();
  });
});
