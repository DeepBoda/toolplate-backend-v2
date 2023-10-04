"use strict";
const sequelize = require("sequelize");
const service = require("./service");
const reply = require("../blogCommentReply/service");
const blogService = require("../blog/service");
const { usersqquery, sqquery } = require("../../utils/query");
const BlogCommentReply = require("../blogCommentReply/model");
const User = require("../user/model");

exports.add = async (req, res, next) => {
  try {
    req.body.userId = req.requestor.id;
    const data = await service.create(req.body);

    blogService.update(
      { comments: sequelize.literal("comments  + 1") },
      { where: req.body.blogId }
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
    const userId = req.requestor?.id || null; // Check if req.requestor is defined before using it

    const data = await service.findAll({
      ...sqquery(req.query),
      attributes: [
        "id",
        "comment",
        "createdAt",
        "blogId",
        "userId",
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `blogCommentLikes` WHERE `blogComment`.`id` = `blogCommentLikes`.`blogCommentId` )"
          ),
          "likes",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `blogCommentLikes` WHERE `blogCommentId` = `blogComment`.`id` AND `blogCommentLikes`.`userId` = :UserId)"
          ),
          "isLiked",
        ],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "username", "profilePic"],
        },
        {
          model: BlogCommentReply,
          required: false,
          attributes: [
            "id",
            "reply",
            "createdAt",
            "userId",
            [
              sequelize.literal(
                "(SELECT COUNT(*) FROM `blogCommentReplyLikes` WHERE `blogCommentReplies`.`id` = `blogCommentReplyLikes`.`blogCommentReplyId` )"
              ),
              "likes",
            ],
            [
              sequelize.literal(
                "(SELECT COUNT(*) FROM `blogCommentReplyLikes` WHERE `blogCommentReplyId` = `blogCommentReplies`.`id` AND `blogCommentReplyLikes`.`userId` = :UserId)"
              ),
              "isLiked",
            ],
          ],
          include: {
            model: User,
            attributes: ["id", "username", "profilePic"],
          },
        },
      ],
      replacements: { UserId: userId },
    });

    const totalComments = data.length; // Calculate the total count of comments
    const totalCommentReplies = data.reduce(
      (total, comment) => total + (comment.blogCommentReplies || []).length,
      0
    ); // Calculate the total count of comment replies

    res.status(200).send({
      status: "success",
      data: {
        count: totalComments + totalCommentReplies,
        rows: data,
      },
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
      attributes: [
        "id",
        "comment",
        "createdAt",
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `blogCommentLikes` WHERE `blogComment`.`id` = `blogCommentLikes`.`blogCommentId` )"
          ),
          "likes",
        ],
      ],
      include: [
        {
          model: BlogCommentReply,
          required: false,
          attributes: ["id", "reply"],
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
    // Handle errors here
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const affectedRows = await service.delete({
      where: {
        id: req.params.id,
      },
    });
    await reply.delete({
      where: {
        id: req.params.id,
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
