const request = require('supertest');
const app = require('../app');
const Project = require('../models/project');

jest.mock('../models/project', () => ({
  find: jest.fn()
}));

describe('GET /api/projects/search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: search query returns matching projects
  it('should search projects and return matching results', async () => {
    const matchingProjects = [
      {
        projectId: 1000,
        name: 'Website Redesign',
        description: 'Redesign the company website',
        startDate: '2026-08-01',
        endDate: '2026-12-31',
        dateCreated: '2026-07-20T10:00:00.000Z',
        dateModified: '2026-07-20T10:00:00.000Z'
      }
    ];

    const sortMock = jest.fn().mockResolvedValue(matchingProjects);
    Project.find.mockReturnValue({ sort: sortMock });

    const response = await request(app)
      .get('/api/projects/search')
      .query({ query: 'website' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Projects searched successfully');
    expect(response.body.projects).toEqual(matchingProjects);
    expect(Project.find).toHaveBeenCalledWith({
      $or: expect.any(Array)
    });
    expect(sortMock).toHaveBeenCalledWith({ dateModified: -1 });
  });

  // Test 2: empty search query returns empty results and skips database search
  it('should return an empty array when query is empty', async () => {
    const response = await request(app)
      .get('/api/projects/search')
      .query({ query: '' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Projects searched successfully');
    expect(response.body.projects).toEqual([]);
    expect(Project.find).not.toHaveBeenCalled();
  });

  // Test 3: database/service error returns 500
  it('should return 500 when the project search fails', async () => {
    const sortMock = jest.fn().mockRejectedValue(new Error('Database failure'));
    Project.find.mockReturnValue({ sort: sortMock });

    const response = await request(app)
      .get('/api/projects/search')
      .query({ query: 'website' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unable to search projects');
  });
});
