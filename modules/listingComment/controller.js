"use strict";
const sequelize = require("sequelize");
const service = require("./service");
const reply = require("../listingCommentReply/service");
const listingService = require("../listing/service");
const { usersqquery, sqquery } = require("../../utils/query");
const ListingCommentReply = require("../listingCommentReply/model");
const User = require("../user/model");
const { userAdminAttributes } = require("../../constants/queryAttributes");

exports.add = async (req, res, next) => {
  try {
    req.body.userId = req.requestor.id;
    const data = await service.create(req.body);

    listingService.update(
      { comments: sequelize.literal("comments  + 1") },
      { where: { id: req.body.listingId } }
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
        "listingId",
        "userId",
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `listingCommentLikes` WHERE `listingComment`.`id` = `listingCommentLikes`.`listingCommentId` )"
          ),
          "likes",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `listingCommentLikes` WHERE `listingCommentId` = `listingComment`.`id` AND `listingCommentLikes`.`userId` = :UserId)"
          ),
          "isLiked",
        ],
      ],
      include: [
        {
          model: User,
          attributes: userAdminAttributes,
        },
        {
          model: ListingCommentReply,
          required: false,
          attributes: [
            "id",
            "reply",
            "createdAt",
            "userId",
            [
              sequelize.literal(
                "(SELECT COUNT(*) FROM `listingCommentReplyLikes` WHERE `listingCommentReplies`.`id` = `listingCommentReplyLikes`.`listingCommentReplyId` )"
              ),
              "likes",
            ],
            [
              sequelize.literal(
                "(SELECT COUNT(*) FROM `listingCommentReplyLikes` WHERE `listingCommentReplyId` = `listingCommentReplies`.`id` AND `listingCommentReplyLikes`.`userId` = :UserId)"
              ),
              "isLiked",
            ],
          ],
          include: {
            model: User,
            attributes: userAdminAttributes,
          },
        },
      ],
      replacements: { UserId: userId },
    });

    const totalComments = data.length; // Calculate the total count of comments
    const totalCommentReplies = data.reduce(
      (total, comment) => total + (comment.listingCommentReplies || []).length,
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

exports.getAllForAdmin = async (req, res, next) => {
  try {
    const data = await service.findAll({
      ...sqquery(req.query),
      attributes: [
        "id",
        "comment",
        "createdAt",
        "listingId",
        "userId",
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `listingCommentLikes` WHERE `listingComment`.`id` = `listingCommentLikes`.`listingCommentId` )"
          ),
          "likes",
        ],
      ],
      include: [
        {
          model: User,
          attributes: userAdminAttributes,
          paranoid: false, // Include soft-deleted users
        },
        {
          model: ListingCommentReply,
          required: false,
          attributes: [
            "id",
            "reply",
            "createdAt",
            "userId",
            [
              sequelize.literal(
                "(SELECT COUNT(*) FROM `listingCommentReplyLikes` WHERE `listingCommentReplies`.`id` = `listingCommentReplyLikes`.`listingCommentReplyId` )"
              ),
              "likes",
            ],
          ],
          include: {
            model: User,
            attributes: userAdminAttributes,
            paranoid: false, // Include soft-deleted users
          },
        },
      ],
    });

    const totalComments = data.length; // Calculate the total count of comments
    const totalCommentReplies = data.reduce(
      (total, comment) => total + (comment.listingCommentReplies || []).length,
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
            "(SELECT COUNT(*) FROM `listingCommentLikes` WHERE `listingComment`.`id` = `listingCommentLikes`.`listingCommentId` )"
          ),
          "likes",
        ],
      ],
      include: [
        {
          model: ListingCommentReply,
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
    // Update the listing data
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
    // Find the data before deletion
    const [data, replies] = await Promise.all([
      service.findOne({
        where: {
          id: req.params.id,
        },
      }),
      reply.count({
        where: {
          id: req.params.id,
        },
      }),
    ]);

    if (data) {
      // Delete the data
      const [affectedRows] = await Promise.all([
        service.delete({
          where: {
            id: req.params.id,
          },
        }),
        reply.delete({
          where: {
            id: req.params.id,
          },
        }),
      ]);
      // Update the listing's comments count
      listingService.update(
        { comments: sequelize.literal(`comments - ${replies + 1}`) },
        { where: { id: data.listingId } }
      );

      // Send the response with a status code of 200 and affected rows count
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
    // Handle any errors
    next(error);
  }
};
