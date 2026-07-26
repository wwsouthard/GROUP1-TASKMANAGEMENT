const request = require('supertest');
const projectService = require('../services/project');
const app = require('../app');

jest.mock('../services/project', () => ({
  listProjects: jest.fn()
}));

describe('GET /api/projects', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with a list of projects', async () => {
    const mockProjects = [
      {
        _id: 'project-1',
        projectId: 1000,
        name: 'Website Redesign',
        description: 'Update the company website',
        startDate: '2026-07-01T00:00:00.000Z',
        endDate: '2026-08-01T00:00:00.000Z'
      }
    ];

    projectService.listProjects.mockResolvedValue(mockProjects);

    const response = await request(app).get('/api/projects');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Projects retrieved successfully');
    expect(response.body.projects).toEqual(mockProjects);
  });

  it('should return 200 with an empty array when no projects exist', async () => {
    projectService.listProjects.mockResolvedValue([]);

    const response = await request(app).get('/api/projects');

    expect(response.status).toBe(200);
    expect(response.body.projects).toEqual([]);
  });

  it('should return 500 when projects cannot be retrieved', async () => {
    projectService.listProjects.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/projects');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unable to retrieve projects');
  });
});
