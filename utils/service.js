/* eslint-disable no-undef */
"use strict";
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const admin = require("../config/firebaseConfig");
const moment = require("moment");

exports.cl = async (tag, message = "", level = "info") => {
  if (process.env.log == 1) {
    const types = {
      debug: console.debug,
      error: console.error,
    };
    const logFunction = types[level] || console.log;
    logFunction(tag, message);
  }
};

exports.jwtDecoder = async (token) => {
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    console.log(err);
    throw new Error("Enter Valid Jwt Token", 400);
  }
};
exports.jwtDecoderForBody = async (token) => {
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    console.log(err);
    throw new Error("Invalid token or missing data", 400);
  }
};

exports.getJwtToken = async (data) => {
  const token = await jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIREIN,
  });
  return token;
};

exports.generateOTP = () => {
  const OTP = Math.floor(100000 + Math.random() * 900000);
  this.cl("OTP", OTP);
  return OTP;
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

exports.createFirebaseUser = async (decodedToken) => {
  try {
    const firebaseUser = await admin.auth().createUser({
      email: decodedToken.email,
      password: decodedToken.password,
      displayName: decodedToken.username,
    });
    return firebaseUser;
  } catch (err) {
    console.log(err);
    throw new Error("Error creating Firebase user");
  }
};

exports.verifyFirebaseUserToken = async (firebase_token) => {
  try {
    const firebaseUser = await admin.auth().verifyIdToken(firebase_token);

    return firebaseUser;
  } catch (err) {
    console.log(err);
    throw new Error("Error verifying Firebase user token");
  }
};

exports.deleteFirebaseUser = async (uid) => {
  try {
    await admin.auth().deleteUser(uid);
    console.log("Firebase User deleted.");
  } catch (err) {
    console.log(err);
    throw new Error("Error deleting Firebase user");
  }
};

exports.trimUrl = (url) => {
  try {
    const { pathname, search } = new URL(url);
    return `${pathname}${search}`;
  } catch (err) {
    console.log("Error parsing URL:", err);
    return url;
  }
};
