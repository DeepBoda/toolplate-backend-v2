/**
 * Health Check Routes
 * 
 * GET /health - Returns application and dependency health status
 * 
 * This route is mounted BEFORE authentication middleware,
 * so it does not require an API key or JWT token.
 */

const express = require('express');
const router = express.Router();
const { getHealthStatus } = require('./controller');

router.get('/', getHealthStatus);

module.exports = router;
