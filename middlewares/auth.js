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
      return next(createHttpError(401, "Invalid or missing key"));
    }

    if (apiKey === validAPIKey) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
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
        requestor: {
          id: req.requestor.id,
          name: req.requestor.name || req.requestor.username,
          email: req.requestor.email,
          role: req.requestor.role,
        },
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
