/**
 * Update Project API tests
 * Uses Jest + Supertest against the Express `app` (same pattern as task-update-service.test.js).
 * Project model methods are mocked so the real updateProject service logic runs without Atlas.
 */
const request = require('supertest');
const app = require('../app');
const Project = require('../models/project');

jest.mock('../models/project', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

describe('PUT /api/projects/:projectId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function buildExistingProject(overrides = {}) {
    const dateCreated = new Date('2026-07-20T10:00:00.000Z');
    const project = {
      _id: '507f1f77bcf86cd799439020',
      projectId: 223,
      name: 'Original Project',
      description: 'Original description',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-12-31'),
      dateCreated,
      dateModified: new Date('2026-07-20T10:00:00.000Z'),
      save: jest.fn(),
      ...overrides
    };

    project.save.mockImplementation(async function saveProject() {
      return this;
    });

    return project;
  }

  // Test 1: valid projectId + body updates a project and returns 200 + standard success body
  it('should update editable fields, refresh dateModified, and preserve projectId and dateCreated', async () => {
    const existingProject = buildExistingProject();
    const originalDateCreated = existingProject.dateCreated;
    const originalDateModified = existingProject.dateModified;
    const originalProjectId = existingProject.projectId;

    Project.findOne
      .mockResolvedValueOnce(existingProject)
      .mockResolvedValueOnce(null);

    const response = await request(app).put('/api/projects/223').send({
      name: 'Updated Project',
      description: 'Updated description',
      startDate: '2026-09-01',
      endDate: '2026-12-31'
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Project updated successfully');
    expect(response.body.project.projectId).toBe(223);
    expect(response.body.project.dateCreated).toEqual(originalDateCreated.toISOString());
    expect(response.body.project.name).toBe('Updated Project');
    expect(response.body.project.description).toBe('Updated description');
    expect(new Date(response.body.project.dateModified).getTime()).toBeGreaterThan(
      originalDateModified.getTime()
    );
    expect(Project.findOne).toHaveBeenNthCalledWith(1, { projectId: 223 });
    expect(Project.findOne).toHaveBeenNthCalledWith(2, {
      name: 'Updated Project',
      projectId: { $ne: 223 }
    });
    expect(existingProject.save).toHaveBeenCalledTimes(1);
    expect(existingProject.projectId).toBe(originalProjectId);
    expect(existingProject.dateCreated).toBe(originalDateCreated);
    expect(Project.create).not.toHaveBeenCalled();
  });

  // Test 2: no matching project → 404 with safe message and no persistence side effects
  it('should return 404 when no project matches the numeric projectId', async () => {
    Project.findOne.mockResolvedValueOnce(null);

    const response = await request(app).put('/api/projects/223').send({
      name: 'Updated Project',
      description: 'Updated description',
      startDate: '2026-09-01',
      endDate: '2026-12-31'
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Project not found');
    expect(response.body.project).toBeUndefined();
    expect(Project.findOne).toHaveBeenCalledWith({ projectId: 223 });
    expect(Project.findOne).toHaveBeenCalledTimes(1);
    expect(Project.create).not.toHaveBeenCalled();
  });

  // Test 3: endDate not later than startDate → 400 before any database write
  it('should return 400 when endDate is not later than startDate and leave persistence untouched', async () => {
    const existingProject = buildExistingProject();

    const response = await request(app).put('/api/projects/223').send({
      name: 'Updated Project',
      description: 'Updated description',
      startDate: '2026-08-01',
      endDate: '2026-07-01'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('endDate must be later than startDate');
    expect(response.body.project).toBeUndefined();
    expect(Project.findOne).not.toHaveBeenCalled();
    expect(Project.create).not.toHaveBeenCalled();
    expect(existingProject.save).not.toHaveBeenCalled();
    expect(existingProject.name).toBe('Original Project');
    expect(existingProject.startDate).toEqual(new Date('2026-08-01'));
  });

  // Test 4: non-numeric route param is rejected in the controller (service never called)
  it('should return 400 when the projectId is invalid', async () => {
    const response = await request(app).put('/api/projects/not-a-number').send({
      name: 'Updated Project',
      startDate: '2026-08-01'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid project ID');
    expect(response.body.project).toBeUndefined();
    expect(Project.findOne).not.toHaveBeenCalled();
    expect(Project.create).not.toHaveBeenCalled();
  });
});
