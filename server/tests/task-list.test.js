const request = require('supertest');
const taskService = require('../services/task');
const app = require('../app');

jest.mock('../services/task', () => ({
  createTask: jest.fn(),
  listTasks: jest.fn(),
  validateCreateTaskInput: jest.fn()
}));

describe('GET /api/tasks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with a list of tasks', async () => {
    const mockTasks = [
      {
        _id: 'task-1',
        title: 'Design login screen',
        status: 'Pending',
        priority: 'High',
        projectId: 1000
      }
    ];

    taskService.listTasks.mockResolvedValue(mockTasks);

    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Tasks retrieved successfully');
    expect(response.body.tasks).toEqual(mockTasks);
  });

  it('should return 200 with an empty array when no tasks exist', async () => {
    taskService.listTasks.mockResolvedValue([]);

    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(200);
    expect(response.body.tasks).toEqual([]);
  });

  it('should return 500 when tasks cannot be retrieved', async () => {
    taskService.listTasks.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unable to retrieve tasks');
  });
});
