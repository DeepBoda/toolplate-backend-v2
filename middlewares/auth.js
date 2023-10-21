"use strict";

const createHttpError = require("http-errors");
const adminService = require("../modules/admin/service");
const userService = require("../modules/user/service");
const { cl, jwtDecoder } = require("../utils/service");

// Generated 32 char 64 bit api keys
const validAPIKey =
  process.env.NODE_ENV === "production"
    ? process.env.API_KEY
    : process.env.API_KEY_DEV;

// Middleware to validate API key
exports.validateAPIKey = async (req, res, next) => {
  try {
    const apiKey = req.get("x-api-key"); // Assuming API key is in headers
    if (!apiKey) {
      res.status(401).json({ error: "Invalid or missing API key." });
    }
    console.log("apiKey: ", apiKey);
    const keys = apiKey.split("-");
    const finalKey =
      keys[8] +
      "2110" +
      keys[1] +
      "-" +
      keys[2] +
      "toolplate" +
      keys[8] +
      "+" +
      keys[7] +
      "ai" +
      keys[6] +
      "1828" +
      keys[9] +
      "-" +
      keys[8] +
      "tst" +
      keys[9] +
      "-" +
      keys[6];
    console.log("finalKey: ", finalKey);

    if (finalKey === validAPIKey) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error in fetching api key:\n", error);
    return next(error);
  }
};

exports.protectRoute = (roles) => async (req, res, next) => {
  const { role } = req.requestor || {};

  if (!roles.includes(role)) {
    return next(createHttpError(401, "Access denied"));
  }

  next();
};

exports.authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    let requestor = null;
    let role = null;

    if (token) {
      const jwtUser = await jwtDecoder(token);

      if (jwtUser.role === "Admin") {
        requestor = await adminService.findOne({
          where: {
            id: jwtUser.id,
          },
        });
        role = "Admin";
      } else if (jwtUser.role === "User") {
        requestor = await userService.findOne({
          where: {
            id: jwtUser.id,
          },
        });
        role = "User";
      }
    }
    if (requestor) {
      requestor.dataValues.role = role;
      req.requestor = requestor.toJSON();

      cl("🧑🏻‍💻 API Call --->", {
        API: req.method + " " + req.originalUrl,
        body: req.body,
        requestor: requestor.toJSON(),
      });
    } else {
      req.requestor = null;
    }

    next();
  } catch (error) {
    console.error("Error in authMiddleware:\n", error);
    return next(error);
  }
};
