const request = require('supertest');
const app = require('../app');

describe('GET /api/health', () => {
  it('should return API health message', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task Management System API is running');
  });
});
