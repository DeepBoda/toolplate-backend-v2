/**
 * Health Check Routes
 * 
 * GET /health - Returns application and dependency health status
 * GET /health?verbose=true - Includes system metrics (CPU, memory)
 * 
 * This route is mounted BEFORE authentication middleware,
 * so it does not require an API key or JWT token.
 * Query params are validated via Joi schema.
 */

const express = require('express');
const router = express.Router();
const { getHealthStatus } = require('./controller');
const joiSchema = require('./joiSchema');

/**
 * Validate query params against Joi schema
 */
const validateQuery = (req, res, next) => {
    const { error, value } = joiSchema.query.validate(req.query);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: `Invalid query parameter: ${error.details[0].message}`,
        });
    }
    req.query = value;
    next();
};

router.get('/', validateQuery, getHealthStatus);

module.exports = router;
