"use strict";

// const { Op, literal } = require("sequelize");
const createError = require("http-errors");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const service = require("./service");
const { deleteFilesFromAwsS3Bucket } = require("../../utils/service");

const { cl, jwtDecoder } = require("../../utils/service");
const { sqquery } = require("../../utils/query");

exports.signup = async (req, res, next) => {
  try {
    if (req.file) req.body.profilePic = req.file.location;
    const user = await service.create(req.body);

    const token = jwt.sign(
      {
        ...user.toJSON(),
        role: "User",
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      status: "success",
      data: user,
      token,
    });
  } catch (err) {
    cl(err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await service.findOne({ where: { email } });

    if (user) {
      const correctPassword = await bcryptjs.compare(password, user.password);

      if (correctPassword) {
        const token = jwt.sign(
          {
            id: user.id,
            role: "User",
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIREIN }
        );

        res.status(200).json({
          status: "success",
          message: "Login successful",
          token,
          role: "User",
        });
      } else {
        throw createError(
          401,
          "Login failed because Email and Password don't match"
        );
      }
    } else {
      throw createError(
        401,
        "Login failed because Email and Password don't match"
      );
    }
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  const userId = req.requestor.id;
  const user = await service.findOne({
    where: {
      id: userId,
    },
  });

  res.status(200).send({
    status: "success",
    data: user,
  });
};

exports.updateProfile = async (req, res, next) => {
  try {
    let oldUserData;
    if (req.file) {
      req.body.profilePic = req.file.location;
      oldUserData = await service.findOne({
        where: {
          id: req.requestor.id,
        },
      });
    }
    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.requestor.id,
      },
    });

    // Get the updated user and sign a login token
    const user = await service.findOne({
      where: {
        id: req.requestor.id,
      },
    });

    // const token = jwt.sign(
    //   {
    //     ...user.toJSON(),
    //     role: "User",
    //   },
    //   process.env.JWT_SECRET
    // );

    res.status(200).json({
      status: "success",
      data: {
        affectedRows,
      },
      // token,
    });
    if (req.file && oldUserData?.profilePic)
      deleteFilesFromAwsS3Bucket(oldUserData?.profilePic);
  } catch (err) {
    next(err);
  }
};

// <=============== For Admins ===================>

exports.getAll = async (req, res, next) => {
  const users = await service.findAll({});

  res.status(200).send({
    status: "success",
    data: users,
  });
};

exports.getById = async (req, res, next) => {
  const user = await service.findOne({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).send({
    status: "success",
    data: user,
  });
};

exports.deleteById = async (req, res, next) => {
  const affectedRows = await service.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).json({
    status: "success",
    message: "delete user successfully",
    data: {
      affectedRows,
    },
  });
};
