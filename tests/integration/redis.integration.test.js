/**
 * Redis Caching Integration Tests
 * 
 * Verifies that the tool controller correctly uses the cache service
 * for optimal performance on the `getAll` endpoint.
 */

// Use shared integration setup
require('../integration.setup');

const request = require('supertest');

// ─── Mocks ───

// Mock Auth Middleware to bypass checks
jest.mock('../../middlewares/auth', () => ({
    validateAPIKey: (req, res, next) => next(),
    protectRoute: () => (req, res, next) => next(),
    authMiddleware: (req, res, next) => next(),
}));

// Mock Cache Service with inline factory
jest.mock('../../modules/cache/service', () => {
    return {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        flush: jest.fn(),
        generateKey: jest.fn((prefix, identifier) => `tp:${prefix}:${JSON.stringify(identifier)}`),
    };
});

// Mock Tool Service with inline factory
jest.mock('../../modules/tool/service', () => ({
    findAndCountAll: jest.fn().mockResolvedValue({
        count: 1,
        rows: [{ id: 1, title: 'Cached Tool', isWishlisted: false }]
    }),
}));

// Lazy load app after mocks
const app = require('../../app');

// Get references to mocked modules for assertions
const cacheService = require('../../modules/cache/service');
const toolService = require('../../modules/tool/service');

describe('Redis Cache Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Reset default mock implementations if needed
        toolService.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: [{ id: 1, title: 'Cached Tool', isWishlisted: false }]
        });
    });

    test('checks cache before DB on getAll', async () => {
        // Setup: Cache Miss
        cacheService.get.mockResolvedValue(null);

        const res = await request(app).get('/api/v1/tool');

        expect(res.status).toBe(200);
        expect(res.body.data.rows[0].title).toBe('Cached Tool');

        // Verify Cache Check
        expect(cacheService.get).toHaveBeenCalled();
        const key = cacheService.get.mock.calls[0][0];
        expect(key).toContain('tp:tools:');

        // Verify DB Call
        expect(toolService.findAndCountAll).toHaveBeenCalled();

        // Verify Cache Set
        expect(cacheService.set).toHaveBeenCalledWith(key, expect.objectContaining({ rows: expect.any(Array) }));
    });

    test('returns cached data and skips DB on cache hit', async () => {
        // Setup: Cache Hit
        const cachedData = { count: 5, rows: [{ id: 99, title: 'Redis Hit' }] };
        cacheService.get.mockResolvedValue(cachedData);

        const res = await request(app).get('/api/v1/tool');

        expect(res.status).toBe(200);
        expect(res.body.data.rows[0].title).toBe('Redis Hit');

        // Verify Cache Check
        expect(cacheService.get).toHaveBeenCalled();

        // Verify NO DB Call
        expect(toolService.findAndCountAll).not.toHaveBeenCalled();

        // Verify NO Cache Set (read only)
        expect(cacheService.set).not.toHaveBeenCalled();
    });
});
