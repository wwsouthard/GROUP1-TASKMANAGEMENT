const request = require('supertest');
const express = require('express');

const projectController = require('../controllers/project');
const projectService = require('../services/project');

jest.mock('../services/project');

const app = express();

app.use(express.json());

app.get('/api/projects/:projectId', projectController.getProjectById);

describe('GET /api/projects/:projectId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a project when a valid projectId is provided', async () => {
    const mockProject = {
      projectId: 223,
      title: 'Test Project',
      description: 'Test Description'
    };

    projectService.getProject.mockResolvedValue(mockProject);

    const response = await request(app)
      .get('/api/projects/223');

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      message: 'Project retrieved successfully',
      project: mockProject
    });

    expect(projectService.getProject)
      .toHaveBeenCalledWith(223);
  });

  it('should return 200 with project null when project is not found', async () => {
    projectService.getProject.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/projects/223');

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      message: 'Project retrieved successfully',
      project: null
    });

    expect(projectService.getProject)
      .toHaveBeenCalledWith(223);
  });

  it('should return 500 when the service throws an error', async () => {
    projectService.getProject.mockRejectedValue(
      new Error('Database connection failed')
    );

    const response = await request(app).get('/api/projects/223');

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toEqual('Unable to retrieve project');

    expect(projectService.getProject).toHaveBeenCalledWith(223);
  });

  it('should handle an invalid projectId', async () => {
    const response = await request(app).get('/api/projects/not-a-number');

    expect(response.statusCode).toBe(400);
  });
});