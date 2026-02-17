/**
 * Tool Comparison API Tests
 * 
 * Tests for POST /api/v1/tool/compare endpoint that returns
 * structured comparison data for 2-4 tools.
 */

// Mock Redis
jest.mock('../config/redis', () => ({
    get: jest.fn(),
    set: jest.fn(),
    isReady: true,
    ping: jest.fn().mockResolvedValue('PONG'),
}));

// Mock Sequelize DB
jest.mock('../config/db', () => ({
    authenticate: jest.fn().mockResolvedValue(true),
    literal: jest.fn((val) => val),
}));

// Mock the tool service
jest.mock('../modules/tool/service', () => ({
    findOne: jest.fn(),
    findAll: jest.fn(),
}));

// Mock Redis utils
jest.mock('../utils/redis', () => ({
    get: jest.fn(),
    set: jest.fn(),
}));

const { compareTools } = require('../modules/tool/compareController');
const toolService = require('../modules/tool/service');
const redisUtils = require('../utils/redis');

const createMockTool = (slug, overrides = {}) => ({
    id: Math.floor(Math.random() * 1000),
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    slug,
    description: `${slug} description`,
    image: `https://cdn.toolplate.ai/${slug}_60_60.webp`,
    price: 'Free',
    ratingsAverage: 4.5,
    totalRatings: 100,
    pros: JSON.stringify(['Pro 1', 'Pro 2']),
    cons: JSON.stringify(['Con 1', 'Con 2']),
    link: `https://${slug}.example.com`,
    toJSON() {
        return { ...this };
    },
    ...overrides,
});

describe('POST /api/v1/tool/compare', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        redisUtils.get.mockResolvedValue(null); // No cache by default
        redisUtils.set.mockResolvedValue(undefined);

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });

    test('returns comparison for 2 valid slugs', async () => {
        const tools = [createMockTool('chatgpt'), createMockTool('claude')];
        toolService.findAll.mockResolvedValue(tools);

        mockReq = { body: { slugs: ['chatgpt', 'claude'] } };
        await compareTools(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        const body = mockRes.json.mock.calls[0][0];
        expect(body.status).toBe(200);
        expect(body.data.tools).toHaveLength(2);
    });

    test('returns comparison for 4 valid slugs', async () => {
        const tools = ['chatgpt', 'claude', 'gemini', 'copilot'].map(s => createMockTool(s));
        toolService.findAll.mockResolvedValue(tools);

        mockReq = { body: { slugs: ['chatgpt', 'claude', 'gemini', 'copilot'] } };
        await compareTools(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        const body = mockRes.json.mock.calls[0][0];
        expect(body.data.tools).toHaveLength(4);
    });

    test('returns 400 for fewer than 2 slugs', async () => {
        mockReq = { body: { slugs: ['chatgpt'] } };
        await compareTools(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        const body = mockRes.json.mock.calls[0][0];
        expect(body.status).toBe(400);
        expect(body.message).toMatch(/between 2 and 4/i);
    });

    test('returns 400 for more than 4 slugs', async () => {
        mockReq = { body: { slugs: ['a', 'b', 'c', 'd', 'e'] } };
        await compareTools(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('returns 400 for empty slugs array', async () => {
        mockReq = { body: { slugs: [] } };
        await compareTools(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('returns 400 for missing slugs field', async () => {
        mockReq = { body: {} };
        await compareTools(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('returns 404 for nonexistent slug', async () => {
        // Only 1 of 2 slugs found
        toolService.findAll.mockResolvedValue([createMockTool('chatgpt')]);

        mockReq = { body: { slugs: ['chatgpt', 'nonexistent'] } };
        await compareTools(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        const body = mockRes.json.mock.calls[0][0];
        expect(body.message).toContain('nonexistent');
    });

    test('returns tools in same order as input slugs', async () => {
        const tools = [createMockTool('claude'), createMockTool('chatgpt')];
        toolService.findAll.mockResolvedValue(tools);

        mockReq = { body: { slugs: ['chatgpt', 'claude'] } };
        await compareTools(mockReq, mockRes, mockNext);

        const body = mockRes.json.mock.calls[0][0];
        expect(body.data.tools[0].slug).toBe('chatgpt');
        expect(body.data.tools[1].slug).toBe('claude');
    });

    test('includes all required fields in response', async () => {
        toolService.findAll.mockResolvedValue([createMockTool('chatgpt'), createMockTool('claude')]);

        mockReq = { body: { slugs: ['chatgpt', 'claude'] } };
        await compareTools(mockReq, mockRes, mockNext);

        const body = mockRes.json.mock.calls[0][0];
        const tool = body.data.tools[0];
        expect(tool).toHaveProperty('title');
        expect(tool).toHaveProperty('slug');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('image');
        expect(tool).toHaveProperty('price');
        expect(tool).toHaveProperty('ratingsAverage');
        expect(tool).toHaveProperty('pros');
        expect(tool).toHaveProperty('cons');
        expect(tool).toHaveProperty('link');
    });

    test('caches response in Redis', async () => {
        toolService.findAll.mockResolvedValue([createMockTool('chatgpt'), createMockTool('claude')]);

        mockReq = { body: { slugs: ['chatgpt', 'claude'] } };
        await compareTools(mockReq, mockRes, mockNext);

        expect(redisUtils.set).toHaveBeenCalled();
        const cacheKey = redisUtils.set.mock.calls[0][0];
        expect(cacheKey).toContain('compare');
    });

    test('serves cached response when available', async () => {
        const cachedData = {
            tools: [{ slug: 'chatgpt', title: 'ChatGPT' }],
            comparedAt: new Date().toISOString(),
        };
        redisUtils.get.mockResolvedValue(cachedData);

        mockReq = { body: { slugs: ['chatgpt', 'claude'] } };
        await compareTools(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(toolService.findAll).not.toHaveBeenCalled(); // DB not hit
    });
});
