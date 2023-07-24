const rateLimit = require("express-rate-limit");

//example of ratelimiter
exports.BuySellLimiter = rateLimit({
  windowMs: 1 * 12 * 1000, // 10 sec
  max: 3, // Limit each IP to 2 requests per `window` (here, per 10 second)
  message: async (req, res) => {
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
