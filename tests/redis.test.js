/**
 * Cache Service Unit Tests
 * 
 * Verifies that the cache service correctly abstracts Redis operations,
 * handles serialization/deserialization, default TTL, and error conditions.
 */

jest.mock('../config/redis', () => ({
    isReady: true,
    get: jest.fn(),
    set: jest.fn(), // Note: ioredis set with EX args behaves differently in mock
    del: jest.fn(),
    flushAll: jest.fn(),
}));

const redisClient = require('../config/redis');
const cacheService = require('../modules/cache/service');

describe('Cache Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        redisClient.isReady = true;
    });

    describe('set()', () => {
        test('stores value as JSON string with TTL', async () => {
            redisClient.set.mockResolvedValue('OK');
            const key = 'test-key';
            const value = { data: 123 };

            const success = await cacheService.set(key, value, 60);

            expect(success).toBe(true);
            expect(redisClient.set).toHaveBeenCalledWith(
                key,
                JSON.stringify(value),
                'EX',
                60
            );
        });

        test('uses default TTL if not provided', async () => {
            redisClient.set.mockResolvedValue('OK');
            const key = 'test-key';
            const value = 'data';

            await cacheService.set(key, value);

            expect(redisClient.set).toHaveBeenCalledWith(
                key,
                JSON.stringify(value),
                'EX',
                3600 // Default
            );
        });

        test('returns false if redis is not ready', async () => {
            redisClient.isReady = false;
            const success = await cacheService.set('key', 'value');
            expect(success).toBe(false);
            expect(redisClient.set).not.toHaveBeenCalled();
        });

        test('handles redis errors gracefully', async () => {
            redisClient.set.mockRejectedValue(new Error('Redis Error'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const success = await cacheService.set('key', 'value');

            expect(success).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Cache Set Error'), expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('get()', () => {
        test('returns parsed object on hit', async () => {
            const stored = JSON.stringify({ data: 'cached' });
            redisClient.get.mockResolvedValue(stored);

            const result = await cacheService.get('key');

            expect(result).toEqual({ data: 'cached' });
            expect(redisClient.get).toHaveBeenCalledWith('key');
        });

        test('returns null on miss', async () => {
            redisClient.get.mockResolvedValue(null);
            const result = await cacheService.get('key');
            expect(result).toBeNull();
        });

        test('returns null if redis not ready', async () => {
            redisClient.isReady = false;
            const result = await cacheService.get('key');
            expect(result).toBeNull();
            expect(redisClient.get).not.toHaveBeenCalled();
        });

        test('handles JSON parse errors gracefully? (Data corruption)', async () => {
            redisClient.get.mockResolvedValue('{ invalid json');
            // JSON.parse throws. Service catches it? Let's check implementation.
            // Implementation: try { ... JSON.parse ... } catch (error) ...
            // So it should return null ideally, or log error.

            // But implementation catches `error` from `redisClient.get`.
            // Does it catch synchronous errors inside existing try block?
            // Yes, `await redisClient.get` throws async, but subsequent sync code inside `try` is caught.
            // `JSON.parse` is sync.

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await cacheService.get('key');

            expect(result).toBeNull(); // Should catch SyntaxError
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Cache Get Error'), expect.any(SyntaxError));
            consoleSpy.mockRestore();
        });
    });

    describe('del()', () => {
        test('deletes key', async () => {
            redisClient.del.mockResolvedValue(1);
            const success = await cacheService.del('key');
            expect(success).toBe(true);
            expect(redisClient.del).toHaveBeenCalledWith('key');
        });
    });

    describe('flush()', () => {
        test('flushes all cache', async () => {
            redisClient.flushAll.mockResolvedValue('OK');
            const success = await cacheService.flush();
            expect(success).toBe(true);
            expect(redisClient.flushAll).toHaveBeenCalled();
        });
    });

    describe('generateKey()', () => {
        test('formats key with prefix', () => {
            expect(cacheService.generateKey('user', 123)).toBe('tp:user:123');
        });

        test('handles object identifiers', () => {
            const filter = { type: 'admin', active: true };
            const expected = `tp:list:${JSON.stringify(filter)}`;
            expect(cacheService.generateKey('list', filter)).toBe(expected);
        });
    });
});
