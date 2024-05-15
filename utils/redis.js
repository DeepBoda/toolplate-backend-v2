const redisClient = require("../config/redis");

const redisUtils = {
  async get(endPoint) {
    try {
      const data = await redisClient.get(endPoint);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error in Redis GET operation:\n ${error}`);
      return null;
    }
  },

  async set(endPoint, data, expirationTime) {
    try {
      const jsonData = JSON.stringify(data);
      if (expirationTime) {
        await redisClient.set(endPoint, jsonData, { EX: expirationTime });
      } else {
        await redisClient.set(endPoint, jsonData);
      }
      console.log(`Data set successfully in Redis for key: ${endPoint}`);
    } catch (error) {
      console.error(`Error in Redis SET operation:\n ${error}`);
    }
  },

  async del(endPoint) {
    try {
      await redisClient.del(endPoint);
    } catch (error) {
      console.error(`Error in Redis DEL operation:\n ${error}`);
    }
  },

  async hDel(endPoint) {
    try {
      const keys = await redisClient.keys(endPoint);
      if (keys.length) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error(`Error in Redis hDel operation:\n ${error}`);
    }
  },

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
