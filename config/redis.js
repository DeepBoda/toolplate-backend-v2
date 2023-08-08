const { createClient } = require("redis");

const redisClient = createClient({
  url: `redis://:@localhost:${process.env.REDIS_PORT || "6379"}`,
  database: process.env.REDIS_DATABASE || 0,
});

// Async function to connect to Redis client
const connectToRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Error in Redis Connection:\n", error);
  }
};

// Call the async function to connect to Redis
connectToRedis();

module.exports = redisClient;
