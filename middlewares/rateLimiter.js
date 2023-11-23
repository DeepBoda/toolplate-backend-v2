const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const client = require(".././config/redis");
const createError = require("http-errors");

exports.limiter = rateLimit({
  // Rate limiter configuration
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Allow 5 requests per 15 minutes

  // Redis store configuration
  store: new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
  }),
  headers: {
    "Retry-After": 60,
  },
  message: (req, res) => {
    res.status(403).json({
      status: "error",
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
