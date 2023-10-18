"use strict";
const sequelize = require("sequelize");
const service = require("./service");
const blogService = require("../blog/service");
const commentService = require("../blogComment/service");
const { usersqquery, sqquery } = require("../../utils/query");
const BlogComment = require("../blogComment/model");

exports.add = async (req, res, next) => {
  try {
    req.body.userId = req.requestor.id;

    const [data, comment] = await Promise.all([
      service.create(req.body),

      commentService.findOne({
        where: { id: req.body.blogCommentId },
      }),
    ]);

    blogService.update(
      { comments: sequelize.literal("comments  + 1") },
      { where: { id: comment.blogId } }
    );

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await service.findAndCountAll(sqquery(req.query));

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
    const data = await service.findOne({
      where: {
        id: req.params.id,
      },
      include: { model: BlogComment },
    });

    if (data) {
      const affectedRows = await service.delete({
        where: {
          id: req.params.id,
        },
      });
      blogService.update(
        { comments: sequelize.literal("comments  - 1") },
        { where: { id: data.blogComment.blogId } }
      );

      res.status(200).send({
        status: "success",
        data: {
          affectedRows,
        },
      });
    } else {
      // Return a 404 response if the data doesn't exist
      res.status(404).send({
        status: "error",
        message: "Data not found.",
      });
    }
  } catch (error) {
    next(error);
  }
};
