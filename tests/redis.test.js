/**
 * Redis Cache Optimization Tests
 * 
 * Tests for the improved Redis utility with default TTLs,
 * prefix-based flush, and key namespacing.
 */

// Mock Redis client
jest.mock('../config/redis', () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    flushAll: jest.fn(),
    isReady: true,
}));

const redisClient = require('../config/redis');
const redisUtils = require('../utils/redis');
const CACHE_TTL = require('../constants/cacheTTL');

describe('Redis Cache Optimization', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        redisClient.set.mockResolvedValue('OK');
        redisClient.get.mockResolvedValue(null);
        redisClient.del.mockResolvedValue(1);
        redisClient.keys.mockResolvedValue([]);
    });

    // ─── TTL enforcement ───

    describe('set() TTL behavior', () => {
        test('applies default TTL when none provided', async () => {
            await redisUtils.set('test-key', { data: 'value' });

            expect(redisClient.set).toHaveBeenCalledWith(
                'test-key',
                JSON.stringify({ data: 'value' }),
                { EX: CACHE_TTL.DEFAULT }
            );
        });

        test('respects explicit TTL when provided', async () => {
            await redisUtils.set('test-key', { data: 'value' }, 600);

            expect(redisClient.set).toHaveBeenCalledWith(
                'test-key',
                JSON.stringify({ data: 'value' }),
                { EX: 600 }
            );
        });

        test('uses specific TTL constant', async () => {
            await redisUtils.set('category:list', { items: [] }, CACHE_TTL.CATEGORY);

            expect(redisClient.set).toHaveBeenCalledWith(
                'category:list',
                JSON.stringify({ items: [] }),
                { EX: 86400 }
            );
        });
    });

    // ─── get() behavior ───

    describe('get()', () => {
        test('returns parsed JSON for existing keys', async () => {
            redisClient.get.mockResolvedValue(JSON.stringify({ name: 'test' }));

            const result = await redisUtils.get('test-key');
            expect(result).toEqual({ name: 'test' });
        });

        test('returns null for non-existing keys', async () => {
            redisClient.get.mockResolvedValue(null);

            const result = await redisUtils.get('missing-key');
            expect(result).toBeNull();
        });

        test('returns null on error', async () => {
            redisClient.get.mockRejectedValue(new Error('Connection lost'));

            const result = await redisUtils.get('test-key');
            expect(result).toBeNull();
        });
    });

    // ─── flushByPrefix ───

    describe('flushByPrefix()', () => {
        test('deletes only matching keys', async () => {
            redisClient.keys.mockResolvedValue(['tool:1', 'tool:2']);
            redisClient.del.mockResolvedValue(2);

            const count = await redisUtils.flushByPrefix('tool:*');

            expect(redisClient.keys).toHaveBeenCalledWith('tool:*');
            expect(redisClient.del).toHaveBeenCalledWith(['tool:1', 'tool:2']);
            expect(count).toBe(2);
        });

        test('handles no matching keys gracefully', async () => {
            redisClient.keys.mockResolvedValue([]);

            const count = await redisUtils.flushByPrefix('nonexistent:*');

            expect(redisClient.keys).toHaveBeenCalledWith('nonexistent:*');
            expect(redisClient.del).not.toHaveBeenCalled();
            expect(count).toBe(0);
        });

        test('returns 0 on error', async () => {
            redisClient.keys.mockRejectedValue(new Error('Redis error'));

            const count = await redisUtils.flushByPrefix('tool:*');
            expect(count).toBe(0);
        });
    });

    // ─── del() behavior ───

    describe('del()', () => {
        test('deletes a specific key', async () => {
            await redisUtils.del('key-to-delete');
            expect(redisClient.del).toHaveBeenCalledWith('key-to-delete');
        });
    });

    // ─── hDel pattern delete ───

    describe('hDel()', () => {
        test('deletes all keys matching pattern', async () => {
            redisClient.keys.mockResolvedValue(['blog:1', 'blog:2', 'blog:3']);

            await redisUtils.hDel('blog:*');

            expect(redisClient.keys).toHaveBeenCalledWith('blog:*');
            expect(redisClient.del).toHaveBeenCalledWith(['blog:1', 'blog:2', 'blog:3']);
        });

        test('does nothing when no keys match', async () => {
            redisClient.keys.mockResolvedValue([]);

            await redisUtils.hDel('empty:*');

            expect(redisClient.del).not.toHaveBeenCalled();
        });
    });
});
