"use strict";

const createError = require("http-errors");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const service = require("./service");

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
      return next(createError(400, "Incorrect email or password!"));

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
      admin,
    });
  } catch (error) {
    next(error);
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

exports.update = async (req, res, next) => {
  try {
    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "success",
      data: { affectedRows },
    });
  } catch (error) {
    next(error);
  }
};
