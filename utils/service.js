"use strict";
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const moment = require("moment");

exports.cl = (tag, message = "", level = "info") => {
  if (process.env.log == 1) {
    const types = {
      debug: console.debug,
      error: console.error,
    };
    const logFunction = types[level] || console.log;
    logFunction(tag, message);
  }
};

exports.jwtDecoder = async (req) => {
  try {
    if (!req.headers.authorization)
      throw new Error("JWT Token is required", 401);
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Enter Valid Jwt Token", 401);
  }
};

exports.getJwtToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIREIN,
  });
};

exports.dateFilter = (query, dateColumn = "createdAt") => {
  const dateFilter = {};
  const { startDate, endDate } = query;
  if (startDate) {
    dateFilter[dateColumn] = {
      [Op.gte]: new Date(startDate),
      [Op.lt]: endDate
        ? new Date(moment(endDate).add(1, "days"))
        : new Date(moment().add(1, "days")),
    };
  }

  return dateFilter;
};
