"use strict";

const jwt = require("jsonwebtoken");
const adminService = require("../modules/admin/service");
const userService = require("../modules/user/service");
const { cl, jwtDecoder } = require("../utils/service");
const createHttpError = require("http-errors");

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
