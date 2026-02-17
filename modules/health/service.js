/**
 * Health Check Service
 * 
 * Abstracts health check logic for database, Redis, and system metrics.
 * Separates infrastructure concerns from HTTP controller layer.
 * 
 * @module modules/health/service
 */

const db = require('../../config/db');
const redisClient = require('../../config/redis');
const os = require('os');

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
 * Check all dependency health status
 * @returns {Object} - { database, redis }
 */
const checkDependencies = async () => {
    const [database, redis] = await Promise.all([
        checkService('database', () => db.authenticate()),
        checkService('redis', () => redisClient.ping()),
    ]);
    return { database, redis };
};

/**
 * Determine overall health status from dependency results
 * @param {Object} dependencies - { database, redis }
 * @returns {boolean} - true if all deps are connected
 */
const isAllHealthy = (dependencies) => {
    return Object.values(dependencies).every(
        (dep) => dep.status === 'connected'
    );
};

/**
 * Get system resource metrics (CPU, memory)
 * Used when ?verbose=true is passed
 * @returns {Object} - { memory, cpu, platform, nodeVersion }
 */
const getSystemMetrics = () => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
        memory: {
            total_mb: Math.round(totalMem / 1024 / 1024),
            used_mb: Math.round(usedMem / 1024 / 1024),
            free_mb: Math.round(freeMem / 1024 / 1024),
            usage_percent: Math.round((usedMem / totalMem) * 100),
        },
        cpu: {
            cores: os.cpus().length,
            model: os.cpus()[0]?.model || 'unknown',
            load_avg: os.loadavg(),
        },
        platform: os.platform(),
        nodeVersion: process.version,
    };
};

/**
 * Build the full health response body
 * @param {Object} dependencies - Dependency check results
 * @param {boolean} verbose - Include system metrics
 * @returns {Object} - Complete health response
 */
const buildHealthResponse = (dependencies, verbose = false) => {
    const healthy = isAllHealthy(dependencies);

    const response = {
        status: healthy ? 'healthy' : 'unhealthy',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        dependencies,
    };

    if (verbose) {
        response.system = getSystemMetrics();
    }

    return {
        statusCode: healthy ? 200 : 503,
        body: response,
    };
};

module.exports = {
    checkService,
    checkDependencies,
    isAllHealthy,
    getSystemMetrics,
    buildHealthResponse,
};
