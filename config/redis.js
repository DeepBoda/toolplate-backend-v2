const { createClient } = require("redis");

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_DATABASE = process.env.REDIS_DATABASE || 0;

const redisClient = createClient({
  url: `redis://:@localhost:${REDIS_PORT}`,
  database: REDIS_DATABASE,
});

redisClient.on("ready", () => {
  console.log(`Redis connected successfully to \x1b[32m[${REDIS_PORT}]\x1b[0m`);
});

redisClient.on("error", (err) => {
  console.error("Error in Redis Connection:", err);
});

(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Error initializing Redis client:", error);
  }
})();

module.exports = redisClient;
