const { createClient } = require("redis");

const redisClient = createClient({
  url: `redis://:@localhost:${
    process.env.NODE_ENV === "production" ? "6380" : "6379"
  }`,
  database: process.env.NODE_ENV === "production" ? 1 : 0,
});

(async function () {
  await redisClient.connect();
})();

redisClient.on("ready", () => {
  console.log("Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.log("Error in Redis Connection", err);
});

module.exports = redisClient;
