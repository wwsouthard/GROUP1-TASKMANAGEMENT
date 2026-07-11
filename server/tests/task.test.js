/**
 * Sprint 1 — Create Task API tests
 * Uses Jest + Supertest against the Express `app` (same pattern as health.test.js).
 * Task model methods are mocked so tests stay isolated and do not touch Atlas.
 */
const request = require('supertest');
const app = require('../app');
const Task = require('../models/task');

// Mock the Task model so create/findOne never hit the real database
jest.mock('../models/task', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  VALID_STATUSES: ['Pending', 'In Progress', 'Completed'],
  VALID_PRIORITIES: ['Low', 'Medium', 'High']
}));

describe('POST /api/tasks', () => {
  // Reset mocks between tests so cases do not depend on execution order
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: valid payload creates a task and returns 201 + standard success body
  it('should create a task and return 201 with the created task', async () => {
    const requestBody = {
      title: 'Write sprint documentation',
      description: 'Document the create task API',
      status: 'Pending',
      priority: 'High',
      projectId: 1000,
      dueDate: '2026-07-20T00:00:00.000Z'
    };

    const createdTask = {
      _id: '507f1f77bcf86cd799439011',
      title: requestBody.title,
      description: requestBody.description,
      status: requestBody.status,
      priority: requestBody.priority,
      projectId: requestBody.projectId,
      dueDate: new Date(requestBody.dueDate),
      dateCreated: new Date('2026-07-11T16:00:00.000Z'),
      dateModified: new Date('2026-07-11T16:00:00.000Z'),
      taskId: null
    };

    // No existing task with this title; create resolves with the saved document
    Task.findOne.mockResolvedValue(null);
    Task.create.mockResolvedValue(createdTask);

    const response = await request(app).post('/api/tasks').send(requestBody);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Task created successfully');
    expect(response.body.task).toMatchObject({
      title: requestBody.title,
      status: requestBody.status,
      priority: requestBody.priority,
      projectId: requestBody.projectId
    });
    expect(Task.findOne).toHaveBeenCalledWith({ title: requestBody.title });
    expect(Task.create).toHaveBeenCalledTimes(1);
  });

  // Test 2: missing required field (projectId) returns 400 and skips persistence
  it('should reject a request missing a required field and not create a task', async () => {
    const response = await request(app).post('/api/tasks').send({
      title: 'Incomplete task',
      status: 'Pending',
      priority: 'Low'
      // projectId intentionally omitted
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Missing required field(s): projectId');
    expect(Task.findOne).not.toHaveBeenCalled();
    expect(Task.create).not.toHaveBeenCalled();
  });

  // Test 3: duplicate title returns 409 and does not call Task.create
  it('should reject a duplicate title with a client error response', async () => {
    Task.findOne.mockResolvedValue({
      _id: '507f1f77bcf86cd799439012',
      title: 'Design login screen'
    });

    const response = await request(app).post('/api/tasks').send({
      title: 'Design login screen',
      status: 'Pending',
      priority: 'Medium',
      projectId: 1000
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('A task with this title already exists');
    expect(Task.create).not.toHaveBeenCalled();
  });
});
