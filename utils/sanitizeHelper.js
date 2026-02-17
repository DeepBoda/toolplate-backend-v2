/**
 * Joi Sanitization Helper
 * 
 * Provides a custom Joi extension or helper function to sanitize strings
 * within Joi validation schemas using the same logic as the middleware.
 * 
 * @module utils/sanitizeHelper
 */

const { sanitizeValue } = require('../middlewares/sanitize');

/**
 * Joi extension that automatically sanitizes string inputs.
 * 
 * usage:
 * const Joi = require('joi').extend(joiSanitize);
 * const schema = Joi.string().sanitize();
 */
const joiSanitize = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.sanitize': '{{#label}} contains unsafe characters',
    },
    rules: {
        sanitize: {
            validate(value, helpers, args, options) {
                return sanitizeValue(value);
            },
        },
    },
});

/**
 * Manual helper to sanitize a value if not using the extension
 */
const sanitizeString = (value) => sanitizeValue(value);

module.exports = {
    joiSanitize,
    sanitizeString,
};
