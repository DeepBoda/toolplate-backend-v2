const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const client = require(".././config/redis");

exports.limiter = rateLimit({
  // Rate limiter configuration
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5, // Allow 5 requests per 15 minute

  // Redis store configuration
  store: new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
  }),

  // Custom message for rate limit exceeded
  message: (req, res) => {
    res.status(403).send("Too many requests. Try again after 15 minutes.");
  },

  keyGenerator: (req) => {
    // Use a combination of IP and API route for key generation
    return `${req.ip}:${req.originalUrl}`;
  },
});
