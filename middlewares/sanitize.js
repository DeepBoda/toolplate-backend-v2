/**
 * Input Sanitization Middleware
 * 
 * Global middleware that sanitizes all string fields in request bodies
 * to prevent XSS attacks, HTML injection, and SQL injection patterns.
 * 
 * Applied after JSON parsing and before route handlers.
 * Does NOT modify non-string values (numbers, booleans, null).
 * 
 * @module middlewares/sanitize
 */

/**
 * Dangerous HTML/XSS patterns to strip
 */
const XSS_PATTERNS = [
    // Script tags (with content)
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    // Script tags (self-closing or incomplete)
    /<script\b[^>]*\/?>/gi,
    // Event handlers (onclick, onerror, onload, onmouseover, etc.)
    /\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi,
    // javascript: protocol in href/src/action
    /(?:href|src|action)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi,
    // Standalone javascript: protocol
    /javascript\s*:/gi,
    // HTML tags with dangerous attributes (iframe, embed, object)
    /<\/?(?:iframe|embed|object|applet|form|input|button|textarea|select)\b[^>]*>/gi,
    // data: URI in attributes (data:text/html)
    /data\s*:\s*text\/html/gi,
    // Expression/eval patterns
    /expression\s*\(/gi,
    /eval\s*\(/gi,
];

/**
 * SQL injection patterns to neutralize
 */
const SQL_PATTERNS = [
    /('\s*;\s*DROP\s+TABLE)/gi,
    /('\s*;\s*DELETE\s+FROM)/gi,
    /('\s*;\s*UPDATE\s+\w+\s+SET)/gi,
    /('\s*;\s*INSERT\s+INTO)/gi,
    /(UNION\s+SELECT)/gi,
    /(UNION\s+ALL\s+SELECT)/gi,
    /(\bOR\s+1\s*=\s*1)/gi,
    /(\bAND\s+1\s*=\s*1)/gi,
    /(--\s*$)/gm,
];

/**
 * Sanitize a single value.
 * - Strings: strips dangerous HTML/JS patterns and SQL injection
 * - Non-strings: returned unchanged
 * 
 * @param {*} value - Value to sanitize
 * @returns {*} - Sanitized value
 */
const sanitizeValue = (value) => {
    if (typeof value !== 'string') {
        return value;
    }

    let sanitized = value;

    // Strip XSS patterns
    for (const pattern of XSS_PATTERNS) {
        sanitized = sanitized.replace(pattern, '');
    }

    // Strip remaining HTML tags (but preserve content)
    sanitized = sanitized.replace(/<\/?[^>]+(>|$)/g, '');

    // Neutralize SQL injection patterns
    for (const pattern of SQL_PATTERNS) {
        sanitized = sanitized.replace(pattern, '');
    }

    // Trim excess whitespace caused by removals
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
};

/**
 * Recursively sanitize all string values in an object or array.
 * 
 * @param {Object|Array} obj - Object or array to sanitize
 * @returns {Object|Array} - Sanitized copy
 */
const sanitizeBody = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeBody(item));
    }

    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = sanitizeValue(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = sanitizeBody(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }

    return sanitizeValue(obj);
};

/**
 * Express middleware that sanitizes req.body.
 * Must be mounted after express.json() and before route handlers.
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response  
 * @param {Function} next - Express next middleware
 */
const sanitizeMiddleware = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeBody(req.body);
    }
    next();
};

module.exports = { sanitizeValue, sanitizeBody, sanitizeMiddleware };
