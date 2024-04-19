const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const client = require(".././config/redis");

// Set the environment variable NODE_ENV to "production" in your production environment.
const isProduction = process.env.NODE_ENV === "production";

let limiter;

if (isProduction) {
  limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Allow 3 requests per 15 minutes
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
      return `${req.ip}:${req.originalUrl}`;
    },
  });
} else {
  // No rate limiting in development
  limiter = (req, res, next) => next();
}

exports.limiter = limiter;
