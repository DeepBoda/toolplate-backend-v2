const redisClient = require("../config/redis");

/**
 *
 * @param {String} endPoint
 * @returns
 */
exports.get = async (endPoint) => {
  const data = await redisClient.GET(endPoint);
  if (data) return JSON.parse(data);
  return null;
};

/**
 *
 * @param {String} endPoint
 * @param {Array | Object | String | Number | Boolean} data
 */
exports.set = async (endPoint, data) => {
  await redisClient.SET(endPoint, JSON.stringify(data));
};

/**
 *
 * @param {Array} endPoint
 */
exports.del = async (endPoint) => {
  await redisClient.DEL(endPoint);
};

/**
 *
 * @param {String} endPoint
 */
exports.hDel = async (endPoint) => {
  try {
    let keys = await redisClient.KEYS(endPoint);
    if (keys.length) {
      await redisClient.DEL(keys);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.flushAll = async () => {
  try {
    await redisClient.FLUSHALL();
  } catch (error) {
    console.log(error);
  }
};
