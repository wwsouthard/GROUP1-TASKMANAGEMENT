const request = require('supertest');
const express = require('express');

const taskController = require('../controllers/task');
const taskService = require('../services/task');

jest.mock('../services/task');

const app = express();

app.use(express.json());

app.delete('/api/tasks/:taskId', taskController.deleteTask);

describe('DELETE /api/tasks/:taskId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete an existing task', async () => {
    const mockTask = {
      taskId: 23,
      title: 'Test Task',
      description: 'Test Description',
      status: 'Pending',
      priority: 'High',
      projectId: 1
    };

    taskService.deleteTask.mockResolvedValue(mockTask);

    const response = await request(app).delete('/api/tasks/23');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Task deleted successfully');

    expect(taskService.deleteTask).toHaveBeenCalledTimes(1);
    expect(taskService.deleteTask).toHaveBeenCalledWith(23);
  });

  it('should return 404 when it cannot find the task to delete', async () => {
    taskService.deleteTask.mockResolvedValue(null);

    const response = await request(app).delete('/api/tasks/23');

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Task not found');

    expect(taskService.deleteTask).toHaveBeenCalledWith(23);
  });

  it('should return 500 when there is an error with deleting the task', async() => {
    taskService.deleteTask.mockRejectedValue(
        new Error('Database connection failed')
    );

    const response = await request(app).delete('/api/tasks/23');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unable to delete task');
  });
});