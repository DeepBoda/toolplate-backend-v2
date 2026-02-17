/**
 * Graceful Shutdown Handler
 * 
 * Orchestrates clean shutdown of all application resources when the process
 * receives SIGTERM or SIGINT signals. Ensures:
 * 
 * 1. HTTP server stops accepting new connections
 * 2. In-flight requests complete (up to timeout)
 * 3. Database connection pool is closed
 * 4. Redis client is disconnected
 * 5. Process exits with appropriate code
 */

const SHUTDOWN_TIMEOUT_MS = 30000; // 30 seconds max wait

/**
 * Perform graceful shutdown of all resources
 * @param {Object} server - HTTP server instance
 * @returns {Promise<number>} Exit code (0 = clean, 1 = errors)
 */
const performShutdown = async (server) => {
    console.log('\n🔄 Graceful shutdown initiated...');
    let hasErrors = false;

    // Step 1: Stop accepting new connections
    try {
        await new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) {
                    console.error('❌ Error closing HTTP server:', err.message);
                    reject(err);
                } else {
                    console.log('✅ HTTP server closed — no new connections');
                    resolve();
                }
            });
        });
    } catch {
        hasErrors = true;
    }

    // Step 2: Close database connection pool
    try {
        const db = require('../config/db');
        await db.close();
        console.log('✅ Database connection pool closed');
    } catch (error) {
        console.error('❌ Error closing database:', error.message);
        hasErrors = true;
    }

    // Step 3: Disconnect Redis
    try {
        const redisClient = require('../config/redis');
        await redisClient.quit();
        console.log('✅ Redis client disconnected');
    } catch (error) {
        console.error('❌ Error disconnecting Redis:', error.message);
        hasErrors = true;
    }

    const exitCode = hasErrors ? 1 : 0;
    console.log(`\n${hasErrors ? '⚠️' : '✅'} Shutdown complete (exit code: ${exitCode})`);
    return exitCode;
};

/**
 * Register shutdown signal handlers on the HTTP server
 * @param {Object} server - HTTP server instance
 */
const registerShutdownHandlers = (server) => {
    let isShuttingDown = false;

    const handleSignal = async (signal) => {
        if (isShuttingDown) {
            console.log(`\n⚡ Force shutdown (received ${signal} again)`);
            process.exit(1);
        }

        isShuttingDown = true;
        console.log(`\n📡 Received ${signal}`);

        // Force exit after timeout
        const forceExitTimer = setTimeout(() => {
            console.error('❌ Shutdown timed out — forcing exit');
            process.exit(1);
        }, SHUTDOWN_TIMEOUT_MS + 5000); // 5s buffer over resource timeout

        // Don't let the timer keep the process alive
        forceExitTimer.unref();

        const exitCode = await performShutdown(server);
        process.exit(exitCode);
    };

    process.on('SIGTERM', () => handleSignal('SIGTERM'));
    process.on('SIGINT', () => handleSignal('SIGINT'));
};

module.exports = { performShutdown, registerShutdownHandlers, SHUTDOWN_TIMEOUT_MS };
