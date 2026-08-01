const request = require('supertest');
const express = require('express');

const projectController = require('../controllers/project');
const projectService = require('../services/project');

jest.mock('../services/project');

const app = express();

app.use(express.json());

app.delete('/api/projects/:projectId', projectController.deleteProject);

describe('DELETE /api/projects/:projectId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete an existing project', async () => {
    const mockProject = {
      projectId: 223,
      name: 'Test Project',
      description: 'Test Description',
      startDate: 'Today'
    };

    projectService.deleteProject.mockResolvedValue(mockProject);

    const response = await request(app).delete('/api/projects/223');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Project deleted successfully');

    expect(projectService.deleteProject).toHaveBeenCalledTimes(1);
    expect(projectService.deleteProject).toHaveBeenCalledWith(223);
  });

  it('should return 404 when it cannot find the project to delete', async () => {
    projectService.deleteProject.mockResolvedValue(null);

    const response = await request(app).delete('/api/projects/223');

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Project not found');

    expect(projectService.deleteProject).toHaveBeenCalledWith(223);
  });

  it('should return 500 when there is an error with deleting the project', async() => {
    projectService.deleteProject.mockRejectedValue(
        new Error('Database connection failed')
    );

    const response = await request(app).delete('/api/projects/223');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unable to delete project');
  });

  it('should return 400 when the projectId is invalid', async () => {
    const response = await request(app).delete('/api/projects/not-a-number');

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid project ID');
    expect(projectService.deleteProject).not.toHaveBeenCalled();
  });
});