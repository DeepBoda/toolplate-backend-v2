"use strict";

const jwt = require("jsonwebtoken");
const adminService = require("../modules/admin/service");
const userService = require("../modules/user/service");
const { cl, jwtDecoder } = require("../utils/service");
const createHttpError = require("http-errors");

exports.protectRoute = (roles) => async (req, res, next) => {
  try {
    const jwtUser = await jwtDecoder(req);
    if (!roles.includes(jwtUser.role)) {
      return next(createHttpError(401, "Access denied"));
    }

    req.requestor = jwtUser;
    next();
  } catch (error) {
    return next(createHttpError(401, "Invalid Jwt Token"));
  }
};

exports.authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  try {
    let requestor = null;
    let role = null;

    if (token) {
      const jwtUser = jwt.verify(token, process.env.JWT_SECRET);

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
    } else {
      // If requestor is not found, set it to null
      req.requestor = null;
    }

    next();

    if (requestor) {
      cl("🧑🏻‍💻 API Call --->", {
        API: req.method + " " + req.originalUrl,
        body: req.body,
        // query: req.query,
        requestor: requestor.toJSON(),
      });
    }
  } catch (error) {
    console.error("Error in authMiddleware:\n", error);
    next(error);
  }
};
