const { createClient } = require("redis");

const redisClient = createClient({
  url: `redis://:@localhost:${process.env.REDIS_PORT || "6379"}`,
  database: process.env.REDIS_DATABASE || 0,
});

// Listen for Redis client connection event
redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

// Listen for Redis client error event
redisClient.on("error", (error) => {
  console.error("Error in Redis Connection:\n", error);
});

module.exports = redisClient;
