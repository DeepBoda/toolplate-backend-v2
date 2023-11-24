const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const client = require(".././config/redis");

exports.limiter = rateLimit({
  // Rate limiter configuration
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Allow 3 requests per 15 minutes

  // Redis store configuration
  store: new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
  }),
  message: (req, res) => {
    res.status(403).send({
      status: "fail",
      message: "Too many requests. Try again after 15 minutes.",
    });
  },

  skip: (req, res) => {
    return req.ip === "127.0.0.1";
  },
  keyGenerator: (req) => {
    // Use a combination of IP and API route for key generation
    return `${req.ip}:${req.originalUrl}`;
  },
});
