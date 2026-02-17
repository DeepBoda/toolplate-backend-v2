/**
 * Redis Cache Utility
 * 
 * Provides a wrapper around the Redis client with:
 * - Default TTL enforcement (no more infinite-TTL entries)
 * - Prefix-based cache invalidation (targeted flush instead of flushAll)
 * - JSON serialization/deserialization
 * - Graceful error handling (returns null on failure, never crashes)
 * 
 * @module utils/redis
 */

const redisClient = require("../config/redis");
const CACHE_TTL = require("../constants/cacheTTL");

const redisUtils = {
  /**
   * Get a cached value by key
   * @param {string} key - Cache key
   * @returns {*|null} - Parsed value or null
   */
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error in Redis GET operation:\n ${error}`);
      return null;
    }
  },

  /**
   * Set a cached value with TTL enforcement.
   * If no TTL is provided, CACHE_TTL.DEFAULT (3600s) is used.
   * This prevents infinite-TTL cache entries.
   * 
   * @param {string} key - Cache key
   * @param {*} data - Value to cache (will be JSON stringified)
   * @param {number} [expirationTime] - TTL in seconds (defaults to CACHE_TTL.DEFAULT)
   */
  async set(key, data, expirationTime) {
    try {
      const jsonData = JSON.stringify(data);
      const ttl = expirationTime || CACHE_TTL.DEFAULT;
      await redisClient.set(key, jsonData, { EX: ttl });
      console.log(`Data set successfully in Redis for key: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      console.error(`Error in Redis SET operation:\n ${error}`);
    }
  },

  /**
   * Delete a specific cache key
   * @param {string} key - Cache key to delete
   */
  async del(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error(`Error in Redis DEL operation:\n ${error}`);
    }
  },

  /**
   * Delete all cache keys matching a glob pattern
   * @param {string} pattern - Glob pattern (e.g., "tool:*")
   */
  async hDel(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error(`Error in Redis hDel operation:\n ${error}`);
    }
  },

  /**
   * Flush cache entries matching a prefix pattern.
   * Replacement for brute flushAll — allows targeted cache invalidation.
   * 
   * @param {string} prefix - Key prefix pattern (e.g., "tool:*", "blog:list:*")
   * @returns {number} - Number of keys deleted
   */
  async flushByPrefix(prefix) {
    try {
      const keys = await redisClient.keys(prefix);
      if (keys.length === 0) {
        return 0;
      }
      const deleted = await redisClient.del(keys);
      console.log(`Flushed ${deleted} keys matching pattern: ${prefix}`);
      return deleted;
    } catch (error) {
      console.error(`Error in Redis flushByPrefix operation:\n ${error}`);
      return 0;
    }
  },

  /**
   * Flush entire Redis cache (admin operation)
   * Use flushByPrefix() for targeted invalidation instead.
   */
  async flushAll(req, res, next) {
    try {
      await redisClient.flushAll();
      res.status(200).json({
        status: "success",
        message: "Redis cleaned successfully!",
      });
    } catch (error) {
      console.error(`Error in Redis FLUSHALL operation:\n ${error}`);
      next(error);
    }
  },
};

module.exports = redisUtils;
