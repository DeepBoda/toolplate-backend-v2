/**
 * Health Check Controller
 * 
 * HTTP handler for GET /health endpoint.
 * Delegates to service layer for dependency checks and response building.
 * 
 * @module modules/health/controller
 */

const healthService = require('./service');

/**
 * GET /health
 * GET /health?verbose=true
 * 
 * Returns application health status with dependency checks.
 * When verbose=true, includes system metrics (CPU, memory, platform).
 * Does NOT require authentication.
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getHealthStatus = async (req, res) => {
    const verbose = req.query.verbose === 'true' || req.query.verbose === true;

    const dependencies = await healthService.checkDependencies();
    const { statusCode, body } = healthService.buildHealthResponse(dependencies, verbose);

    res.status(statusCode).json(body);
};

module.exports = { getHealthStatus };
