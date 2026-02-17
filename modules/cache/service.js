/**
 * Cache Service
 * 
 * Abstracts Redis operations for caching.
 * Provides consistent key generation, TTL handling, and serialization.
 */

const redisClient = require('../../config/redis');

// Default TTL: 1 hour (in seconds)
const DEFAULT_TTL = 3600;

/**
 * Get cached value for a key
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Parsed value or null
 */
const get = async (key) => {
    if (!redisClient.isReady) return null;

    try {
        const data = await redisClient.get(key);
        if (!data) return null;
        return JSON.parse(data);
    } catch (error) {
        console.error('Cache Get Error:', error);
        return null;
    }
};

/**
 * Set value in cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to store (will be JSON stringified)
 * @param {number} ttl - Time to live in seconds (default: 3600)
 * @returns {Promise<boolean>} - Success status
 */
const set = async (key, value, ttl = DEFAULT_TTL) => {
    if (!redisClient.isReady) return false;

    try {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
        return true;
    } catch (error) {
        console.error('Cache Set Error:', error);
        return false;
    }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
const del = async (key) => {
    if (!redisClient.isReady) return false;

    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        console.error('Cache Del Error:', error);
        return false;
    }
};

/**
 * Flush all cache (Use with caution)
 * @returns {Promise<boolean>}
 */
const flush = async () => {
    if (!redisClient.isReady) return false;
    try {
        await redisClient.flushAll();
        return true;
    } catch (error) {
        console.error('Cache Flush Error:', error);
        return false;
    }
};

/**
 * Generate a standardized cache key
 * @param {string} prefix - Key prefix (e.g. 'tool', 'user')
 * @param {string|object} identifier - Unique ID or query object
 * @returns {string} - Generated key
 */
const generateKey = (prefix, identifier) => {
    const idStr = typeof identifier === 'object'
        ? JSON.stringify(identifier)
        : String(identifier);
    // Basic hash/clean could be added here if identifiers are huge
    return `tp:${prefix}:${idStr}`;
};

module.exports = {
    get,
    set,
    del,
    flush,
    generateKey,
    DEFAULT_TTL,
};
