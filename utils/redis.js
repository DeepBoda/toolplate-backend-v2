const redisClient = require("../config/redis");

/**
 * Get data from Redis.
 * @param {String} endPoint - The endpoint to retrieve data from Redis.
 * @returns {Promise<Object|null>} - The retrieved data from Redis as a parsed JSON object, or null if the data is not found or an error occurs.
 */
exports.get = async (endPoint) => {
  try {
    const data = await redisClient.GET(endPoint);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error in Redis GET operation:\n ${error}`);
    return null;
  }
};

/**
 * Set data in Redis with an expiration time.
 * @param {String} endPoint - The key under which the data will be stored in Redis.
 * @param {Array | Object | String | Number | Boolean} data - The data to be stored in Redis. It can be an array, object, string, number, or boolean.
 * @param {Number} [expirationTime] - Optional. The expiration time for the key in seconds.
 */
exports.set = async (endPoint, data, expirationTime) => {
  try {
    const jsonData = JSON.stringify(data);

    if (expirationTime) {
      await redisClient.SET(endPoint, jsonData, { EX: expirationTime });
    } else {
      await redisClient.SET(endPoint, jsonData);
    }
    console.log(`Data set successfully in Redis for key: ${endPoint}`);
  } catch (error) {
    console.error(`Error in Redis SET operation:\n ${error}`);
  }
};

/**
 * Delete a key from Redis.
 * @param {String} endPoint - The key to be deleted from Redis.
 */
exports.del = async (endPoint) => {
  try {
    await redisClient.DEL(endPoint);
  } catch (error) {
    console.error(`Error in Redis DEL operation:\n ${error}`);
  }
};

/**
 * Delete multiple keys matching a pattern from Redis.
 * @param {String} endPoint - The pattern used to match the keys to be deleted from Redis.
 */
exports.hDel = async (endPoint) => {
  try {
    let keys = await redisClient.KEYS(endPoint);
    if (keys.length) {
      await redisClient.DEL(keys);
    }
  } catch (error) {
    console.error(`Error in Redis hDel operation:\n ${error}`);
  }
};

/**
 * Flush all data in Redis.
 * @param {Request} req - The request object representing the HTTP request made to the server.
 * @param {Response} res - The response object representing the HTTP response that will be sent back to the client.
 * @param {NextFunction} next - The next middleware function in the request-response cycle.
 */
exports.flushAll = async (req, res, next) => {
  try {
    await redisClient.FLUSHALL();
    res.status(200).json({
      status: "success",
      message: "Redis cleaned successfully!",
    });
  } catch (error) {
    console.error(`Error in Redis FLUSHALL operation:\n ${error}`);
    next(error);
  }
};
