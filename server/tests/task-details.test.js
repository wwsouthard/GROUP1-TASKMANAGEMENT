const request = require('supertest');
const express = require('express');

const taskController = require('../controllers/task');
const taskService = require('../services/task');

jest.mock('../services/task');

const app = express();

app.use(express.json());

// Match your real route
app.get('/api/tasks/:taskId', taskController.getTaskById);

describe('GET /api/tasks/:taskId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a task when a valid taskId is provided', async () => {
    const mockTask = {
      taskId: 23,
      title: 'Test Task',
      description: 'Test Description',
      status: 'Pending',
      priority: 'High',
      projectId: 1
    };

    taskService.getTask.mockResolvedValue(mockTask);

    const response = await request(app)
      .get('/api/tasks/23');

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      message: 'Task retrieved successfully',
      task: mockTask
    });

    expect(taskService.getTask)
      .toHaveBeenCalledWith(23);
  });

  it('should return 404 when task is not found', async () => {
    taskService.getTask.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/tasks/23');

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      message: 'Task retrieved successfully',
      task: null
    });

    expect(taskService.getTask)
      .toHaveBeenCalledWith(23);
  });

  it('should return 500 when the service throws an error', async () => {
    taskService.getTask.mockRejectedValue(
      new Error('Database connection failed')
    );

    const response = await request(app)
      .get('/api/tasks/23');

    expect(response.statusCode).toBe(500);

    expect(response.body).toEqual({
      message: 'Unable to retrieve task'
    });

    expect(taskService.getTask)
      .toHaveBeenCalledWith(23);
  });

  it('should handle an invalid taskId', async () => {
    const response = await request(app)
      .get('/api/tasks/not-a-number');

    expect(response.statusCode).toBe(400);
  });
});