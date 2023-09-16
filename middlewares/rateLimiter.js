const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const client = require(".././config/redis");


exports.readLimit = rateLimit({
  // Rate limiter configuration
  windowMs: 1 * 30 * 1000, // 30 sec
  max: 3,
  // Redis store configuration
  store: new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
  }),

  message: (req, res) => {
    res.status(200).json({
      status: "fail",
      message:
        "Excessive trading activity detected. Please wait before making another trade",
      isBanned: true,
    });
  },
  keyGenerator: function (req, res) {
    return req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  },
});
