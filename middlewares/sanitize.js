/**
 * Input Sanitization Middleware
 * 
 * Prevents XSS, HTML injection, and basic SQL injection by sanitizing
 * string inputs in request body, query params, and URL parameters.
 * 
 * @module middlewares/sanitize
 */

const { XSS_PATTERNS } = require('../constants/sanitizePatterns');

/**
 * Sanitize a single value
 * @param {string} value - Value to sanitize
 * @returns {string} - Sanitized value
 */
const sanitizeValue = (value) => {
    if (typeof value !== 'string') return value;

    let sanitized = value;

    // Replace dangerous patterns with empty string or encoded equivalent
    sanitized = sanitized.replace(XSS_PATTERNS.SCRIPT_TAGS, '');
    sanitized = sanitized.replace(XSS_PATTERNS.EVENT_HANDLERS, '');
    sanitized = sanitized.replace(XSS_PATTERNS.JAVASCRIPT_PROTOCOL, '');
    sanitized = sanitized.replace(XSS_PATTERNS.DANGEROUS_TAGS, '');

    // Basic SQLi prevention (for manual queries, though ORM handles most)
    sanitized = sanitized.replace(XSS_PATTERNS.SQL_INJECTION, '');

    return sanitized.trim();
};

/**
 * Recursively sanitize an object or array
 * @param {Object|Array} data - Data structure to sanitize
 * @returns {Object|Array} - Sanitized structure
 */
const sanitizeData = (data) => {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }

    if (typeof data === 'object' && data !== null) {
        const sanitizedObj = {};
        for (const [key, value] of Object.entries(data)) {
            sanitizedObj[key] = sanitizeData(value);
        }
        return sanitizedObj;
    }

    return sanitizeValue(data);
};

/**
 * Express middleware to sanitize inputs
 */
const sanitizeMiddleware = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeData(req.body);
    }

    if (req.query) {
        req.query = sanitizeData(req.query);
    }

    if (req.params) {
        req.params = sanitizeData(req.params);
    }

    next();
};

module.exports = {
    sanitizeValue,
    sanitizeData,
    sanitizeMiddleware,
};
