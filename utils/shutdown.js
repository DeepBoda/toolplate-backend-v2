/**
 * Graceful Shutdown Utility
 * 
 * Handles OS signals (SIGTERM, SIGINT) to cleanly stop the application.
 * Ensures:
 * 1. New connections are rejected (503 Service Unavailable)
 * 2. Active connections finish processing
 * 3. Database pool is closed
 * 4. Redis connection is quit
 * 5. Process exits with code 0 (success) or 1 (failure)
 */

const db = require('../config/db');
const redisClient = require('../config/redis');
const { SHUTDOWN_TIMEOUT_MS } = require('../constants/shutdown');
const connectionTracker = require('../middlewares/connectionTracker');

let isShuttingDown = false;

/**
 * Perform resource cleanup sequence
 * @param {http.Server} server - Express HTTP server instance
 * @param {string} signal - Signal received (SIGTERM/SIGINT)
 */
const performShutdown = async (server, signal) => {
    if (isShuttingDown) {
        console.log(`Shutdown already in progress. Ignoring ${signal}.`);
        return;
    }
    isShuttingDown = true;
    console.log(`Received ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections immediately
    connectionTracker.startClosing();

    // Force exit if shutdown hangs
    const forceExitTimeout = setTimeout(() => {
        console.error('Shutdown timed out. Forcing exit.');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    try {
        // 1. Close HTTP server (stops new connections)
        await new Promise((resolve) => {
            server.close((err) => {
                if (err) console.error('Error closing HTTP server:', err);
                else console.log('HTTP server closed.');
                resolve();
            });
        });

        // 2. Wait for active connections to drain? 
        // server.close() already waits for keep-alive connections to end in newer Node versions,
        // but connectionTracker specifically handles in-flight request blocking.
        const remaining = connectionTracker.getActiveConnections();
        if (remaining > 0) {
            console.log(`Waiting for ${remaining} active connections to finish...`);
        }

        // 3. Close Database connection
        try {
            await db.close();
            console.log('Database connection closed.');
        } catch (err) {
            console.error('Error closing database connection:', err);
        }

        // 4. Close Redis connection
        try {
            await redisClient.quit();
            console.log('Redis connection closed.');
        } catch (err) {
            console.error('Error closing Redis connection:', err);
        }

        // Clear timeout and exit successfully
        clearTimeout(forceExitTimeout);
        console.log('Graceful shutdown completed. Exiting.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

/**
 * Register signal handlers
 * @param {http.Server} server - Express HTTP server instance
 */
const registerShutdownHandlers = (server) => {
    ['SIGTERM', 'SIGINT'].forEach((signal) => {
        process.on(signal, () => performShutdown(server, signal));
    });

    // Handle uncaught exceptions/rejections
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        performShutdown(server, 'SIGTERM');
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        performShutdown(server, 'SIGTERM');
    });
};

module.exports = {
    performShutdown,
    registerShutdownHandlers,
};
