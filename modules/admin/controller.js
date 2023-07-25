"use strict";

const createError = require("http-errors");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const service = require("./service");
const { cl } = require("../../utils/service");

exports.create = async (req, res, next) => {
  try {
    const admin = await service.create(req.body);

    res.status(200).json({
      status: "success",
      data: {
        admin,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await service.findOne({
      where: { email },
    });

    if (!admin || !(await bcryptjs.compare(password, admin.password)))
      return next(createError(401, "Incorrect email or password!"));

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "Admin",
      },
      process.env.JWT_SECRET
    );

    admin.password = undefined;
    res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      role: "Admin",
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const admin = await service.findOne({
      where: { id: req.requestor.id },
      attributes: {
        exclude: ["password", "deletedAt", "updatedAt"],
      },
    });

    admin.password = undefined;
    res.status(200).send({
      status: "success",
      data: {
        admin,
      },
    });
  } catch (error) {
    next(error);
  }
};
