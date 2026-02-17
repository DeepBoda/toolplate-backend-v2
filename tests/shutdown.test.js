/**
 * Graceful Shutdown Unit Tests
 * 
 * Verifies resource cleanup order, signal handling,
 * and error resilience during shutdown.
 */

// Mock dependencies
jest.mock('../config/db', () => ({
    close: jest.fn(),
}));

jest.mock('../config/redis', () => ({
    quit: jest.fn(),
}));

jest.mock('../middlewares/connectionTracker', () => ({
    startClosing: jest.fn(),
    getActiveConnections: jest.fn().mockReturnValue(0),
}));

const http = require('http');
const db = require('../config/db');
const redisClient = require('../config/redis');
const { performShutdown } = require('../utils/shutdown');
const connectionTracker = require('../middlewares/connectionTracker');

describe('Graceful Shutdown Handler', () => {
    let mockServer;
    let exitSpy;
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock HTTP Server
        mockServer = {
            close: jest.fn((cb) => cb && cb()),
        };

        // Spy on process.exit
        exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { });

        // Spy on console to suppress output
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Reset module-level isShuttingDown flag? 
        // Since we import the module, the flag persists. Ideally we'd reset it.
        // For unit tests, we'll recreate the shutdown logic or just test performShutdown directly.
        // Since performShutdown uses a module-level variable, we can only run it once per test file cleanly without hacks.
        // So we'll limit tests to critical paths or assume independent runs if Jest resets modules.
        // Jest resets modules between test files, but not within a file unless we use jest.isolateModules().
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('calls connectionTracker.startClosing() immediately', async () => {
        jest.isolateModules(async () => {
            const { performShutdown } = require('../utils/shutdown');
            await performShutdown(mockServer, 'SIGTERM');
            expect(connectionTracker.startClosing).toHaveBeenCalled();
        });
    });

    test('closes resources in correct order: Server -> DB -> Redis', async () => {
        jest.isolateModules(async () => {
            const { performShutdown } = require('../utils/shutdown');
            const db = require('../config/db');
            const redisClient = require('../config/redis');

            const serverCloseSpy = jest.fn((cb) => cb && cb());
            mockServer.close = serverCloseSpy;

            await performShutdown(mockServer, 'SIGTERM');

            // Verify order of calls
            // Since it's async, we check if they were called.
            // Ideally we'd check timestamps or call order via mock.invocationCallOrder

            const closeOrder = [
                connectionTracker.startClosing.mock.invocationCallOrder[0],
                serverCloseSpy.mock.invocationCallOrder[0],
                db.close.mock.invocationCallOrder[0],
                redisClient.quit.mock.invocationCallOrder[0],
            ];

            // Ensure purely ascending order
            expect(closeOrder[0]).toBeLessThan(closeOrder[1]); // Tracker -> Server
            expect(closeOrder[1]).toBeLessThan(closeOrder[2]); // Server -> DB
            expect(closeOrder[2]).toBeLessThan(closeOrder[3]); // DB -> Redis
        });
    });

    test('exits process with 0 on success', async () => {
        jest.isolateModules(async () => {
            const { performShutdown } = require('../utils/shutdown');
            await performShutdown(mockServer, 'SIGINT');
            expect(exitSpy).toHaveBeenCalledWith(0);
        });
    });

    test('handles database close error gracefully', async () => {
        jest.isolateModules(async () => {
            const db = require('../config/db');
            db.close.mockRejectedValue(new Error('DB Error'));

            const { performShutdown } = require('../utils/shutdown');
            await performShutdown(mockServer, 'SIGTERM');

            // Should still try to close Redis and exit 0 (failure in cleanup shouldn't crash process with 1 usually, but logging error)
            const redisClient = require('../config/redis');
            expect(redisClient.quit).toHaveBeenCalled();
            expect(exitSpy).toHaveBeenCalledWith(0);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error closing database'), expect.any(Error));
        });
    });

    test('handles redis close error gracefully', async () => {
        jest.isolateModules(async () => {
            const redisClient = require('../config/redis');
            redisClient.quit.mockRejectedValue(new Error('Redis Error'));

            const { performShutdown } = require('../utils/shutdown');
            await performShutdown(mockServer, 'SIGTERM');

            expect(exitSpy).toHaveBeenCalledWith(0);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error closing Redis'), expect.any(Error));
        });
    });

    test('forces exit 1 on unhandled error during shutdown', async () => {
        jest.isolateModules(async () => {
            const { performShutdown } = require('../utils/shutdown');
            // Mock server.close to throw
            mockServer.close = jest.fn(() => { throw new Error('Catastrophic failure'); });

            await performShutdown(mockServer, 'SIGTERM');

            expect(exitSpy).toHaveBeenCalledWith(1);
        });
    });
});
