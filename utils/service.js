"use strict";
const jwt = require("jsonwebtoken");
// const AWS = require("aws-sdk");
const { Op } = require("sequelize");
const moment = require("moment");
const { s3 } = require("../config/aws");

exports.cl = (tag, message = "") => {
  if (process.env.log == 1) console.log("👀 ", tag, message);
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

exports.generateOTP = () => {
  const OTP = Math.floor(100000 + Math.random() * 900000);
  this.cl("OTP", OTP);
  return OTP;
};

exports.dateFilter = (query) => {
  const dateFilter = {};
  const { startDate, endDate } = query;
  if (startDate) {
    dateFilter.createdAt = {
      [Op.gte]: new Date(startDate),
      [Op.lt]: endDate
        ? new Date(moment(endDate).add(1, "days"))
        : new Date(moment().add(1, "days")),
    };
  }

  return dateFilter;
};
