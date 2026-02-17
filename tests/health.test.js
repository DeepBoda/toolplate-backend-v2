/**
 * Health Check Endpoint Tests
 * 
 * Tests for GET /health endpoint that reports application and dependency health.
 * All external services are mocked to test both healthy and unhealthy scenarios.
 */

// Mock Sequelize - must be before require
jest.mock('../config/db', () => ({
    authenticate: jest.fn(),
}));

// Mock Redis - must be before require
jest.mock('../config/redis', () => ({
    isReady: true,
    ping: jest.fn(),
}));

const { getHealthStatus } = require('../modules/health/controller');
const db = require('../config/db');
const redisClient = require('../config/redis');

describe('GET /health', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default: all services healthy
        db.authenticate.mockResolvedValue(true);
        redisClient.ping.mockResolvedValue('PONG');
    });

    test('returns 200 when all dependencies are healthy', async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getHealthStatus(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        const body = mockRes.json.mock.calls[0][0];
        expect(body.status).toBe('healthy');
        expect(body.dependencies.database.status).toBe('connected');
        expect(body.dependencies.redis.status).toBe('connected');
    });

    test('returns 503 when database is down', async () => {
        db.authenticate.mockRejectedValue(new Error('Connection refused'));

        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getHealthStatus(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(503);
        const body = mockRes.json.mock.calls[0][0];
        expect(body.status).toBe('unhealthy');
        expect(body.dependencies.database.status).toBe('disconnected');
        expect(body.dependencies.database.error).toBe('Connection refused');
    });

    test('returns 503 when Redis is down', async () => {
        redisClient.ping.mockRejectedValue(new Error('Redis connection lost'));

        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getHealthStatus(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(503);
        const body = mockRes.json.mock.calls[0][0];
        expect(body.status).toBe('unhealthy');
        expect(body.dependencies.redis.status).toBe('disconnected');
        expect(body.dependencies.redis.error).toBe('Redis connection lost');
    });

    test('does not require API key header', async () => {
        const mockReq = { headers: {} };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getHealthStatus(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        const body = mockRes.json.mock.calls[0][0];
        expect(body).toHaveProperty('status');
        expect(body).toHaveProperty('uptime');
        expect(body).toHaveProperty('timestamp');
        expect(body).toHaveProperty('dependencies');
    });

    test('includes uptime as a non-negative number', async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getHealthStatus(mockReq, mockRes);

        const body = mockRes.json.mock.calls[0][0];
        expect(typeof body.uptime).toBe('number');
        expect(body.uptime).toBeGreaterThanOrEqual(0);
    });

    test('includes valid ISO timestamp', async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getHealthStatus(mockReq, mockRes);

        const body = mockRes.json.mock.calls[0][0];
        const parsed = new Date(body.timestamp);
        expect(parsed.toISOString()).toBe(body.timestamp);
    });

    test('includes latency_ms for healthy services', async () => {
        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getHealthStatus(mockReq, mockRes);

        const body = mockRes.json.mock.calls[0][0];
        expect(typeof body.dependencies.database.latency_ms).toBe('number');
        expect(body.dependencies.database.latency_ms).toBeGreaterThanOrEqual(0);
        expect(typeof body.dependencies.redis.latency_ms).toBe('number');
        expect(body.dependencies.redis.latency_ms).toBeGreaterThanOrEqual(0);
    });

    test('handles both DB and Redis down simultaneously', async () => {
        db.authenticate.mockRejectedValue(new Error('DB timeout'));
        redisClient.ping.mockRejectedValue(new Error('Redis timeout'));

        const mockReq = {};
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getHealthStatus(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(503);
        const body = mockRes.json.mock.calls[0][0];
        expect(body.status).toBe('unhealthy');
        expect(body.dependencies.database.status).toBe('disconnected');
        expect(body.dependencies.redis.status).toBe('disconnected');
    });
});
