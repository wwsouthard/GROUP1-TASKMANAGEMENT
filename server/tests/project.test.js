const request = require('supertest');
const app = require('../app');
const Project = require('../models/project');
const Counter = require('../models/counter');

jest.mock('../models/project', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock('../models/counter', () => ({
  findByIdAndUpdate: jest.fn()
}));

describe('POST /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Counter.findByIdAndUpdate.mockResolvedValue({ sequence: 1 });
  });

  // Test 1: valid payload creates a project and returns 201 + standard success body
  it('should create a project and return 201 with the created project', async () => {
    const requestBody = {
      name: 'Website Redesign',
      description: 'Redesign the company website',
      startDate: '2026-08-01',
      endDate: '2026-12-31'
    };

    const createdProject = {
      projectId: 1,
      _id: '507f1f77bcf86cd799439020',
      name: requestBody.name,
      description: requestBody.description,
      startDate: new Date(requestBody.startDate),
      endDate: new Date(requestBody.endDate),
      dateCreated: new Date('2026-07-20T10:00:00.000Z'),
      dateModified: new Date('2026-07-20T10:00:00.000Z')
    };

    Project.findOne.mockResolvedValue(null);
    Project.create.mockResolvedValue(createdProject);

    const response = await request(app).post('/api/projects').send(requestBody);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Project created successfully');
    expect(response.body.project).toMatchObject({
      projectId: 1,
      name: requestBody.name,
      startDate: createdProject.startDate.toISOString(),
      dateCreated: createdProject.dateCreated.toISOString(),
      dateModified: createdProject.dateModified.toISOString()
    });
    expect(Project.findOne).toHaveBeenCalledWith({ name: requestBody.name });
    expect(Project.create).toHaveBeenCalledTimes(1);
  });

  // Test 2: missing name returns 400 and skips persistence
  it('should return 400 when name is missing', async () => {
    const response = await request(app).post('/api/projects').send({
      startDate: '2026-08-01'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Missing required field(s): name');
    expect(Project.findOne).not.toHaveBeenCalled();
    expect(Project.create).not.toHaveBeenCalled();
  });

  // Test 3: missing startDate returns 400 and skips persistence
  it('should return 400 when startDate is missing', async () => {
    const response = await request(app).post('/api/projects').send({
      name: 'Website Redesign'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Missing required field(s): startDate');
    expect(Project.create).not.toHaveBeenCalled();
  });

  // Test 4: invalid startDate string returns 400
  it('should return 400 when startDate is not a valid date', async () => {
    const response = await request(app).post('/api/projects').send({
      name: 'Website Redesign',
      startDate: 'not-a-date'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('startDate must be a valid date');
    expect(Project.create).not.toHaveBeenCalled();
  });

  // Test 5: endDate before startDate returns 400
  it('should return 400 when endDate is not later than startDate', async () => {
    const response = await request(app).post('/api/projects').send({
      name: 'Website Redesign',
      startDate: '2026-08-01',
      endDate: '2026-07-01'
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('endDate must be later than startDate');
    expect(Project.create).not.toHaveBeenCalled();
  });

  // Test 6: duplicate name returns 409 and does not call Project.create
  it('should return 409 when a project with the same name already exists', async () => {
    Project.findOne.mockResolvedValue({
      _id: '507f1f77bcf86cd799439021',
      name: 'Website Redesign'
    });

    const response = await request(app).post('/api/projects').send({
      name: 'Website Redesign',
      startDate: '2026-08-01'
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('A project with this name already exists');
    expect(Project.create).not.toHaveBeenCalled();
  });

  // Test 7: valid payload without optional fields succeeds
  it('should create a project without description or endDate', async () => {
    const createdProject = {
      projectId: 2,
      _id: '507f1f77bcf86cd799439022',
      name: 'Internal Tools',
      description: null,
      startDate: new Date('2026-09-01'),
      endDate: null,
      dateCreated: new Date('2026-07-20T10:00:00.000Z'),
      dateModified: new Date('2026-07-20T10:00:00.000Z')
    };

    Project.findOne.mockResolvedValue(null);
    Project.create.mockResolvedValue(createdProject);

    const response = await request(app).post('/api/projects').send({
      name: 'Internal Tools',
      startDate: '2026-09-01'
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Project created successfully');
    expect(response.body.project).toMatchObject({
      projectId: 2,
      name: 'Internal Tools',
      startDate: createdProject.startDate.toISOString(),
      dateCreated: createdProject.dateCreated.toISOString(),
      dateModified: createdProject.dateModified.toISOString()
    });
    expect(response.body.project.endDate).toBeNull();
    expect(response.body.project.description).toBeNull();
  });
});
