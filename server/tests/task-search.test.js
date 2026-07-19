const request = require('supertest');
const taskService = require('../services/task');
const app = require('../app');

jest.mock('../services/task', () => ({
  createTask: jest.fn(),
  getTask: jest.fn(),
  listTasks: jest.fn(),
  searchTasks: jest.fn(),
  validateCreateTaskInput: jest.fn()
}));

describe('GET /api/tasks/search', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with matching tasks', async () => {
    const mockTasks = [
      {
        _id: 'task-1',
        title: 'Design login screen',
        status: 'Pending',
        priority: 'High',
        projectId: 1000
      }
    ];

    taskService.searchTasks.mockResolvedValue(mockTasks);

    const response = await request(app).get('/api/tasks/search?query=login');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Tasks searched successfully');
    expect(response.body.tasks).toEqual(mockTasks);
    expect(taskService.searchTasks).toHaveBeenCalledWith('login');
  });

  it('should return 200 with an empty array when no tasks match', async () => {
    taskService.searchTasks.mockResolvedValue([]);

    const response = await request(app).get('/api/tasks/search?query=missing');

    expect(response.status).toBe(200);
    expect(response.body.tasks).toEqual([]);
    expect(taskService.searchTasks).toHaveBeenCalledWith('missing');
  });

  it('should return 500 when tasks cannot be searched', async () => {
    taskService.searchTasks.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/tasks/search?query=login');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unable to search tasks');
  });
});
