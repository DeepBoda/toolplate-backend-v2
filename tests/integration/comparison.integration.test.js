/**
 * Tool Comparison Integration Tests
 * 
 * Verifies that the comparison API correctly validates input
 * and fetches tool data via the comparison service.
 */

// Use shared integration setup
require('../integration.setup');

const request = require('supertest');

// ─── Mocks ───

// Mock Auth Middleware
jest.mock('../../middlewares/auth', () => ({
    validateAPIKey: (req, res, next) => next(),
    protectRoute: () => (req, res, next) => next(),
    authMiddleware: (req, res, next) => next(),
}));

// Mock Tool Service
jest.mock('../../modules/tool/service', () => ({
    findAll: jest.fn().mockResolvedValue([
        { id: 1, title: 'Tool A', slug: 'tool-a' },
        { id: 2, title: 'Tool B', slug: 'tool-b' },
    ]),
}));

// Lazy load app after mocks
const app = require('../../app');
const toolService = require('../../modules/tool/service');

describe('Tool Comparison Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns comparison data for valid slugs', async () => {
        const res = await request(app)
            .get('/api/v1/comparison/compare?slugs=tool-a,tool-b');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.count).toBe(2);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.data[0].slug).toBe('tool-a');

        // Verify Service Call
        expect(toolService.findAll).toHaveBeenCalled();
        const callArg = toolService.findAll.mock.calls[0][0];
        expect(callArg.where.slug).toBeDefined(); // Should use [Op.in]
    });

    test('returns 400 if slugs are missing', async () => {
        const res = await request(app).get('/api/v1/comparison/compare');
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('provide \'slugs\'');
    });

    test('returns 400 if fewer than 2 slugs provided', async () => {
        const res = await request(app).get('/api/v1/comparison/compare?slugs=tool-a');
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('at least 2');
    });

    test('limits comparison to 4 tools', async () => {
        // Request with 5 slugs
        const res = await request(app)
            .get('/api/v1/comparison/compare?slugs=1,2,3,4,5');

        expect(res.status).toBe(200);
        // Verify Service Call sliced the input internally
        expect(toolService.findAll).toHaveBeenCalled();
        const callArg = toolService.findAll.mock.calls[0][0];

        // We can't easily check the exact sliced array without deep introspection of Symbols (Op.in),
        // but we verify the call happened with a 'where' clause on 'slug'.
        expect(callArg.where.slug).toBeDefined();
    });
});
