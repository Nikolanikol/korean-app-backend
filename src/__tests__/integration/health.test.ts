import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from '../helpers/testApp.js';

describe('Health Endpoint', () => {
  const app = createTestApp();

  test('GET /health should return status ok', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });

  test('GET /health should have correct content-type', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.headers['content-type']).toMatch(/json/);
  });
});