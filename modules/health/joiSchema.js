/**
 * Health Check Joi Validation Schema
 * 
 * Validates query parameters for the health check endpoint.
 * 
 * @module modules/health/joiSchema
 */

const Joi = require('joi');

module.exports = {
    query: Joi.object().keys({
        verbose: Joi.boolean().default(false),
    }),
};
