/**
 * Health Check Controller
 * 
 * Checks the health of all application dependencies (database, Redis)
 * and returns a structured response with latency metrics.
 */

const db = require('../../config/db');
const redisClient = require('../../config/redis');

/**
 * Check individual service health with latency measurement
 * @param {string} name - Service name
 * @param {Function} checkFn - Async function that tests the service
 * @returns {Object} - { status, latency_ms, error? }
 */
const checkService = async (name, checkFn) => {
    const start = Date.now();
    try {
        await checkFn();
        return {
            status: 'connected',
            latency_ms: Date.now() - start,
        };
    } catch (error) {
        return {
            status: 'disconnected',
            latency_ms: Date.now() - start,
            error: error.message,
        };
    }
};

/**
 * GET /health
 * 
 * Returns application health status with dependency checks.
 * Does NOT require authentication.
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getHealthStatus = async (req, res) => {
    const [database, redis] = await Promise.all([
        checkService('database', () => db.authenticate()),
        checkService('redis', () => redisClient.ping()),
    ]);

    const isHealthy = database.status === 'connected' && redis.status === 'connected';

    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        dependencies: {
            database,
            redis,
        },
    });
};

module.exports = { getHealthStatus };
