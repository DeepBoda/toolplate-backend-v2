"use strict";
const sequelize = require("sequelize");
const service = require("./service");
const blogService = require("../blog/service");
const { usersqquery, sqquery } = require("../../utils/query");
const User = require("../user/model");
const {
  userAdminAttributes,
  blogAdminAttributes,
} = require("../../constants/queryAttributes");
const Blog = require("../blog/model");

exports.likeBlog = async (req, res, next) => {
  try {
    req.body.userId = req.requestor.id;
    const isAlreadyExist = await service.count({
      where: req.body,
    });
    if (isAlreadyExist) {
      await service.delete({
        where: req.body,
      });
      blogService.update(
        { likes: sequelize.literal("likes  - 1") },
        { where: { id: req.body.blogId } }
      );
      res.status(200).json({
        status: "success",
        message: "You removed like!.",
      });
    } else {
      await service.create(req.body);
      blogService.update(
        { likes: sequelize.literal("likes  + 1") },
        { where: { id: req.body.blogId } }
      );
      res.status(200).json({
        status: "success",
        message: "Liked blog 🫣!.",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await service.findAndCountAll({
      ...sqquery(req.query),
      distinct: true, // Add this option to ensure accurate counts
      include: [
        {
          model: User,
          attributes: userAdminAttributes,
        },
        {
          model: Blog,
          attributes: blogAdminAttributes,
        },
      ],
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
    // Update the blog data
    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // Send the response
    res.status(200).json({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    // console.error(error);
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const affectedRows = await service.delete({
      where: {
        userId: req.requestor.id,
      },
    });

    res.status(200).send({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    next(error);
  }
};
