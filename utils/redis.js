const logger = require("./logger");
const redisClient = require("../config/redis");

exports.get = async (endPoint) => {
  try {
    const data = await redisClient.GET(endPoint);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Error in Redis GET operation:\n ${error}`);
    return null;
  }
};

exports.set = async (endPoint, data) => {
  try {
    await redisClient.SET(endPoint, JSON.stringify(data));
  } catch (error) {
    logger.error(`Error in Redis SET operation:\n ${error}`);
  }
};

exports.del = async (endPoint) => {
  try {
    await redisClient.DEL(endPoint);
  } catch (error) {
    logger.error(`Error in Redis DEL operation:\n ${error}`);
  }
};

exports.hDel = async (endPoint) => {
  try {
    let keys = await redisClient.KEYS(endPoint);
    if (keys.length) {
      await redisClient.DEL(keys);
    }
  } catch (error) {
    logger.error(`Error in Redis HDEL operation:\n ${error}`);
  }
};

exports.flushAll = async () => {
  try {
    await redisClient.FLUSHALL();
  } catch (error) {
    logger.error(`Error in Redis FLUSHALL operation:\n ${error}`);
  }
};
