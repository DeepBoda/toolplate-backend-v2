const logger = require("./logger");
const redisClient = require("../config/redis");

// Function to get data from Redis
exports.get = async (endPoint) => {
  try {
    const data = await redisClient.GET(endPoint); // Assuming getAsync is a promisified version of GET

    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Error in Redis GET operation:\n ${error}`);
    return null;
  }
};

// Function to set data in Redis
exports.set = async (endPoint, data) => {
  try {
    await redisClient.SET(endPoint, JSON.stringify(data)); // Assuming setAsync is a promisified version of SET
  } catch (error) {
    logger.error(`Error in Redis SET operation:\n ${error}`);
  }
};

// Function to delete a key from Redis
exports.del = async (endPoint) => {
  try {
    await redisClient.DEL(endPoint); // Assuming delAsync is a promisified version of DEL
  } catch (error) {
    logger.error(`Error in Redis DEL operation:\n ${error}`);
  }
};

// Function to delete multiple keys matching a pattern
exports.hDel = async (endPoint) => {
  try {
    const keys = await redisClient.keysAsync(endPoint); // Assuming keysAsync is a promisified version of KEYS
    if (keys.length) {
      await redisClient.DEL(keys); // Assuming delAsync is a promisified version of DEL
    }
  } catch (error) {
    logger.error(`Error in Redis HDEL operation:\n ${error}`);
  }
};

// Function to flush all keys in Redis (use with caution)
exports.flushAll = async () => {
  try {
    await redisClient.flushallAsync(); // Assuming flushallAsync is a promisified version of FLUSHALL
  } catch (error) {
    logger.error(`Error in Redis FLUSHALL operation:\n ${error}`);
  }
};
