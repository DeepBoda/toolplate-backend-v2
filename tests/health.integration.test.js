/**
 * Health Check Integration Tests
 * 
 * Tests the /health endpoint through the full Express app stack
 * using supertest. Validates route mounting, Joi validation,
 * and response format end-to-end.
 */

// Use shared integration test setup
require('./integration.setup');

const request = require('supertest');
const app = require('../app');

describe('GET /health (Integration)', () => {
    test('responds with 200 and healthy status', async () => {
        const res = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('healthy');
        expect(res.body).toHaveProperty('uptime');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('dependencies');
        expect(res.body.dependencies.database.status).toBe('connected');
        expect(res.body.dependencies.redis.status).toBe('connected');
    });

    test('does NOT require API key header', async () => {
        // Health endpoint is mounted BEFORE validateAPIKey middleware
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
    });

    test('returns system metrics with verbose=true', async () => {
        const res = await request(app).get('/health?verbose=true');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('system');
        expect(res.body.system).toHaveProperty('memory');
        expect(res.body.system).toHaveProperty('cpu');
        expect(res.body.system.memory.total_mb).toBeGreaterThan(0);
    });

    test('excludes system metrics without verbose', async () => {
        const res = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.body).not.toHaveProperty('system');
    });

    test('returns 400 for invalid parameter value', async () => {
        const res = await request(app).get('/health?verbose=invalid-boolean');

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Invalid query parameter/);
    });

    test('returns 503 when database is unreachable', async () => {
        const db = require('../config/db');
        db.authenticate.mockRejectedValueOnce(new Error('ECONNREFUSED'));

        const res = await request(app).get('/health');

        expect(res.status).toBe(503);
        expect(res.body.status).toBe('unhealthy');
        expect(res.body.dependencies.database.status).toBe('disconnected');
        expect(res.body.dependencies.database.error).toBe('ECONNREFUSED');
    });

    test('returns 503 when Redis is unreachable', async () => {
        const redisClient = require('../config/redis');
        redisClient.ping.mockRejectedValueOnce(new Error('Redis not connected'));

        const res = await request(app).get('/health');

        expect(res.status).toBe(503);
        expect(res.body.status).toBe('unhealthy');
        expect(res.body.dependencies.redis.status).toBe('disconnected');
    });

    test('returns correct JSON content-type header', async () => {
        const res = await request(app).get('/health');
        expect(res.headers['content-type']).toMatch(/application\/json/);
    });
});
