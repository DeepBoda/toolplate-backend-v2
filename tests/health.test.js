/**
 * Health Check Unit Tests
 * 
 * Tests for health service layer and controller.
 * All external services are mocked for isolation.
 */

// Mock Sequelize
jest.mock('../config/db', () => ({
    authenticate: jest.fn(),
}));

// Mock Redis
jest.mock('../config/redis', () => ({
    isReady: true,
    ping: jest.fn(),
}));

const db = require('../config/db');
const redisClient = require('../config/redis');
const { getHealthStatus } = require('../modules/health/controller');
const healthService = require('../modules/health/service');

describe('Health Check Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        db.authenticate.mockResolvedValue(true);
        redisClient.ping.mockResolvedValue('PONG');
    });

    // ─── checkDependencies() ───

    describe('checkDependencies()', () => {
        test('returns connected status for healthy services', async () => {
            const deps = await healthService.checkDependencies();
            expect(deps.database.status).toBe('connected');
            expect(deps.redis.status).toBe('connected');
        });

        test('returns disconnected status when DB fails', async () => {
            db.authenticate.mockRejectedValue(new Error('Connection refused'));
            const deps = await healthService.checkDependencies();
            expect(deps.database.status).toBe('disconnected');
            expect(deps.database.error).toBe('Connection refused');
            expect(deps.redis.status).toBe('connected');
        });

        test('returns disconnected status when Redis fails', async () => {
            redisClient.ping.mockRejectedValue(new Error('Redis timeout'));
            const deps = await healthService.checkDependencies();
            expect(deps.database.status).toBe('connected');
            expect(deps.redis.status).toBe('disconnected');
            expect(deps.redis.error).toBe('Redis timeout');
        });

        test('measures latency as a non-negative number', async () => {
            const deps = await healthService.checkDependencies();
            expect(typeof deps.database.latency_ms).toBe('number');
            expect(deps.database.latency_ms).toBeGreaterThanOrEqual(0);
            expect(typeof deps.redis.latency_ms).toBe('number');
            expect(deps.redis.latency_ms).toBeGreaterThanOrEqual(0);
        });
    });

    // ─── isAllHealthy() ───

    describe('isAllHealthy()', () => {
        test('returns true when all deps are connected', () => {
            const deps = {
                database: { status: 'connected', latency_ms: 5 },
                redis: { status: 'connected', latency_ms: 2 },
            };
            expect(healthService.isAllHealthy(deps)).toBe(true);
        });

        test('returns false when any dep is disconnected', () => {
            const deps = {
                database: { status: 'disconnected', latency_ms: 0, error: 'fail' },
                redis: { status: 'connected', latency_ms: 2 },
            };
            expect(healthService.isAllHealthy(deps)).toBe(false);
        });
    });

    // ─── getSystemMetrics() ───

    describe('getSystemMetrics()', () => {
        test('returns memory metrics with valid numbers', () => {
            const metrics = healthService.getSystemMetrics();
            expect(typeof metrics.memory.total_mb).toBe('number');
            expect(metrics.memory.total_mb).toBeGreaterThan(0);
            expect(typeof metrics.memory.used_mb).toBe('number');
            expect(typeof metrics.memory.free_mb).toBe('number');
            expect(metrics.memory.usage_percent).toBeGreaterThanOrEqual(0);
            expect(metrics.memory.usage_percent).toBeLessThanOrEqual(100);
        });

        test('returns CPU info', () => {
            const metrics = healthService.getSystemMetrics();
            expect(metrics.cpu.cores).toBeGreaterThan(0);
            expect(typeof metrics.cpu.model).toBe('string');
            expect(metrics.cpu.load_avg).toHaveLength(3);
        });

        test('returns platform and node version', () => {
            const metrics = healthService.getSystemMetrics();
            expect(typeof metrics.platform).toBe('string');
            expect(metrics.nodeVersion).toMatch(/^v\d+/);
        });
    });

    // ─── buildHealthResponse() ───

    describe('buildHealthResponse()', () => {
        test('returns 200 and healthy for connected deps', () => {
            const deps = {
                database: { status: 'connected', latency_ms: 5 },
                redis: { status: 'connected', latency_ms: 2 },
            };
            const { statusCode, body } = healthService.buildHealthResponse(deps);
            expect(statusCode).toBe(200);
            expect(body.status).toBe('healthy');
            expect(body.dependencies).toEqual(deps);
            expect(body).not.toHaveProperty('system');
        });

        test('returns 503 and unhealthy for disconnected deps', () => {
            const deps = {
                database: { status: 'disconnected', latency_ms: 0, error: 'fail' },
                redis: { status: 'connected', latency_ms: 2 },
            };
            const { statusCode, body } = healthService.buildHealthResponse(deps);
            expect(statusCode).toBe(503);
            expect(body.status).toBe('unhealthy');
        });

        test('includes system metrics when verbose=true', () => {
            const deps = {
                database: { status: 'connected', latency_ms: 5 },
                redis: { status: 'connected', latency_ms: 2 },
            };
            const { body } = healthService.buildHealthResponse(deps, true);
            expect(body).toHaveProperty('system');
            expect(body.system).toHaveProperty('memory');
            expect(body.system).toHaveProperty('cpu');
            expect(body.system).toHaveProperty('platform');
            expect(body.system).toHaveProperty('nodeVersion');
        });

        test('excludes system metrics when verbose=false', () => {
            const deps = {
                database: { status: 'connected', latency_ms: 5 },
                redis: { status: 'connected', latency_ms: 2 },
            };
            const { body } = healthService.buildHealthResponse(deps, false);
            expect(body).not.toHaveProperty('system');
        });

        test('includes valid ISO timestamp', () => {
            const deps = {
                database: { status: 'connected', latency_ms: 5 },
                redis: { status: 'connected', latency_ms: 2 },
            };
            const { body } = healthService.buildHealthResponse(deps);
            const parsed = new Date(body.timestamp);
            expect(parsed.toISOString()).toBe(body.timestamp);
        });

        test('includes uptime as non-negative number', () => {
            const deps = {
                database: { status: 'connected', latency_ms: 5 },
                redis: { status: 'connected', latency_ms: 2 },
            };
            const { body } = healthService.buildHealthResponse(deps);
            expect(typeof body.uptime).toBe('number');
            expect(body.uptime).toBeGreaterThanOrEqual(0);
        });
    });
});

// ─── Controller Tests ───

describe('Health Check Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        db.authenticate.mockResolvedValue(true);
        redisClient.ping.mockResolvedValue('PONG');
    });

    test('returns 200 when all dependencies are healthy', async () => {
        const mockReq = { query: {} };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await getHealthStatus(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        const body = mockRes.json.mock.calls[0][0];
        expect(body.status).toBe('healthy');
        expect(body.dependencies.database.status).toBe('connected');
        expect(body.dependencies.redis.status).toBe('connected');
    });

    test('returns 503 when database is down', async () => {
        db.authenticate.mockRejectedValue(new Error('Connection refused'));

        const mockReq = { query: {} };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await getHealthStatus(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(503);
        const body = mockRes.json.mock.calls[0][0];
        expect(body.status).toBe('unhealthy');
        expect(body.dependencies.database.error).toBe('Connection refused');
    });

    test('returns 503 when Redis is down', async () => {
        redisClient.ping.mockRejectedValue(new Error('Redis timeout'));

        const mockReq = { query: {} };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await getHealthStatus(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(503);
        const body = mockRes.json.mock.calls[0][0];
        expect(body.status).toBe('unhealthy');
        expect(body.dependencies.redis.error).toBe('Redis timeout');
    });

    test('handles both DB and Redis down simultaneously', async () => {
        db.authenticate.mockRejectedValue(new Error('DB down'));
        redisClient.ping.mockRejectedValue(new Error('Redis down'));

        const mockReq = { query: {} };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await getHealthStatus(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(503);
        const body = mockRes.json.mock.calls[0][0];
        expect(body.dependencies.database.status).toBe('disconnected');
        expect(body.dependencies.redis.status).toBe('disconnected');
    });

    test('includes system metrics when verbose=true', async () => {
        const mockReq = { query: { verbose: 'true' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await getHealthStatus(mockReq, mockRes);

        const body = mockRes.json.mock.calls[0][0];
        expect(body).toHaveProperty('system');
        expect(body.system.memory.total_mb).toBeGreaterThan(0);
    });

    test('excludes system metrics by default', async () => {
        const mockReq = { query: {} };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await getHealthStatus(mockReq, mockRes);

        const body = mockRes.json.mock.calls[0][0];
        expect(body).not.toHaveProperty('system');
    });

    test('does not require API key header', async () => {
        const mockReq = { headers: {}, query: {} };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await getHealthStatus(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        const body = mockRes.json.mock.calls[0][0];
        expect(body).toHaveProperty('status');
        expect(body).toHaveProperty('uptime');
        expect(body).toHaveProperty('timestamp');
        expect(body).toHaveProperty('dependencies');
    });
});
