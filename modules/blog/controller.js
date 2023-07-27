"use strict";
const { fn, col } = require("sequelize");
const service = require("./service");
const viewService = require("../blogView/service");
const sequelize = require("../../config/db");
// const redisService = require("../../utils/redis");
const { cl } = require("../../utils/service");
const { usersqquery, sqquery } = require("../../utils/query");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const BlogComment = require("../blogComment/model");
const BlogCommentReply = require("../blogCommentReply/model");
const BlogCommentReplyLike = require("../blogCommentReplyLike/model");
const BlogCategory = require("../blogCategory/model");
const Category = require("../category/model");
const BlogTag = require("../blogTag/model");
const Tag = require("../tag/model");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    if (req.file) req.body.image = req.file.location;
    const data = await service.create(req.body);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    cl(err);
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    // let data = await redisService.get(`blogs`);
    // if (!data)
    const data = await service.findAll({
      ...sqquery(req.query),
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM `blogViews` WHERE `blog`.`id` = `blogViews`.`blogId` )"
            ),
            "views",
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM `blogLikes` WHERE `blog`.`id` = `blogLikes`.`blogId` )"
            ),
            "likes",
          ],
        ],
      },
      include: [
        {
          model: BlogCategory,
          attributes: ["id", "blogId", "categoryId"],
          include: {
            model: Category,
            attributes: ["id", "name"],
          },
        },
      ],
    });

    // redisService.set(`blogs`, data);

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
    // let data = await redisService.get(`oneBlog`);
    // if (!data)
    const data = await service.findOne({
      where: {
        id: req.params.id,
      },
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM `blogViews` WHERE `blog`.`id` = `blogViews`.`blogId` )"
            ),
            "views",
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM `blogLikes` WHERE `blog`.`id` = `blogLikes`.`blogId` )"
            ),
            "likes",
          ],
        ],
      },
      include: [
        {
          model: BlogCategory,
          attributes: ["id", "blogId", "categoryId"],
          include: {
            model: Category,
            attributes: ["id", "name"],
          },
        },
        {
          model: BlogTag,
          attributes: ["id", "blogId", "tagId"],
          include: {
            model: Tag,
            attributes: ["id", "name"],
          },
        },

        {
          model: BlogComment,
          required: false,
          attributes: [
            "id",
            "comment",
            [
              sequelize.literal(
                "(SELECT COUNT(*) FROM `blogCommentLikes` WHERE `blogComments`.`id` = `blogCommentLikes`.`blogCommentId` )"
              ),
              "likes",
            ],
          ],
          include: [
            {
              model: BlogCommentReply,
              required: false,
              attributes: [
                "id",
                "reply",
                // [fn("COUNT", col("blogCommentReplyLikes.id")), "likes"],
                // [
                //   sequelize.fn(
                //     "(SELECT COUNT(*) FROM `blogCommentReplyLikes` WHERE `blogCommentReply`.`id` = `blogCommentReplyLikes`.`blogCommentReplyId`)"
                //   ),
                //   "likes",
                // ],

                // [
                //   sequelize.fn(
                //     "COUNT",
                //     sequelize.col(`blogCommentReplyLike.id`)
                //   ),
                //   "likes",
                // ],
              ],
              // include: {
              //   model: BlogCommentReplyLike,
              //   required: false,
              //   attributes: [],
              //   attributes: {
              //     include: [
              //       // [sequelize.fn("COUNT", sequelize.col(`*`)), "likes"],
              //       "id",
              //     ],
              //   },
              // },
            },
          ],
        },
      ],
    });
    await viewService.create({
      blogId: req.params.id,
      userId: req.requestor?.id ?? null,
    });
    // redisService.set(`oneBlog`, data);

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
    let oldBlogData;
    if (req.file) {
      req.body.image = req.file.location;
      oldBlogData = await service.findOne({
        where: {
          id: req.params.id,
        },
      });
    }

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

    // Handle the file deletion
    if (req.file && oldBlogData?.image) deleteFilesFromS3([oldBlogData?.image]);
  } catch (err) {
    // Handle errors here
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    // If a image URL is present, delete the file from S3
    const { image } = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

    const affectedRows = await service.delete({
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
    // Handle the file deletion
    if (image) deleteFilesFromS3([image]);
  } catch (error) {
    next(error);
  }
};
