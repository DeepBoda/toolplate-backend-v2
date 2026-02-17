/**
 * Graceful Shutdown Tests
 * 
 * Tests for the shutdown handler that ensures clean process termination
 * by closing database connections, Redis, and in-flight HTTP requests.
 */

jest.mock('../config/db', () => ({
    close: jest.fn(),
}));

jest.mock('../config/redis', () => ({
    quit: jest.fn(),
    isReady: true,
}));

const db = require('../config/db');
const redisClient = require('../config/redis');
const { performShutdown } = require('../utils/shutdown');

describe('Graceful Shutdown', () => {
    let mockServer;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        db.close.mockResolvedValue();
        redisClient.quit.mockResolvedValue();
        mockServer = {
            close: jest.fn((cb) => cb()),
        };
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('closes sequelize pool on shutdown', async () => {
        const promise = performShutdown(mockServer);
        await promise;

        expect(db.close).toHaveBeenCalledTimes(1);
    });

    test('disconnects redis on shutdown', async () => {
        const promise = performShutdown(mockServer);
        await promise;

        expect(redisClient.quit).toHaveBeenCalledTimes(1);
    });

    test('stops accepting new connections', async () => {
        const promise = performShutdown(mockServer);
        await promise;

        expect(mockServer.close).toHaveBeenCalledTimes(1);
    });

    test('returns exit code 0 on clean shutdown', async () => {
        const exitCode = await performShutdown(mockServer);
        expect(exitCode).toBe(0);
    });

    test('returns exit code 1 when sequelize close fails', async () => {
        db.close.mockRejectedValue(new Error('Cannot close pool'));

        const exitCode = await performShutdown(mockServer);
        expect(exitCode).toBe(1);
    });

    test('returns exit code 1 when redis quit fails', async () => {
        redisClient.quit.mockRejectedValue(new Error('Redis disconnect error'));

        const exitCode = await performShutdown(mockServer);
        expect(exitCode).toBe(1);
    });

    test('closes all resources even if one fails', async () => {
        db.close.mockRejectedValue(new Error('DB error'));

        await performShutdown(mockServer);

        // Redis should still be closed even if DB fails
        expect(redisClient.quit).toHaveBeenCalledTimes(1);
        expect(mockServer.close).toHaveBeenCalledTimes(1);
    });

    test('handles server close failure gracefully', async () => {
        mockServer.close = jest.fn((cb) => cb(new Error('Server close error')));

        const exitCode = await performShutdown(mockServer);
        expect(exitCode).toBe(1);
    });
});
