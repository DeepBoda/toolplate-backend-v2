"use strict";

const sequelize = require("../../config/db");
const service = require("./service");
const blogService = require("../blog/service");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  blogAttributes,
  blogCategoryAttributes,
  userAdminAttributes,
  blogAdminAttributes,
} = require("../../constants/queryAttributes");
const Blog = require("../blog/model");
const BlogCategory = require("../blogCategory/model");
const Category = require("../category/model");
const User = require("../user/model");

exports.add = async (req, res, next) => {
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
        { wishlists: sequelize.literal("wishlists  - 1") },
        { where: { id: req.body.blogId } }
      );

      res.status(200).json({
        status: "success",
        message: "Blog removed from wishlist!.",
      });
    } else {
      await service.create(req.body);
      blogService.update(
        { wishlists: sequelize.literal("wishlists  + 1") },
        { where: { id: req.body.blogId } }
      );

      res.status(200).json({
        status: "success",
        message: "Blog added to wishlist!.",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(
        req.query,
        {
          userId: req.requestor.id,
        }
        // ["$blogs.title$"]
      ),
      include: {
        model: Blog,
        attributes: [
          ...blogAttributes,
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM blogLikes WHERE blogLikes.blogId = blog.id AND blogLikes.UserId = ${userId}) > 0`
            ),
            "isLiked",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM blogWishlists WHERE blogWishlists.blogId = blog.id AND blogWishlists.UserId = ${userId}) > 0`
            ),
            "isWishlisted",
          ],
        ],
        include: {
          model: BlogCategory,
          attributes: ["id", "blogId", "categoryId"],
          include: {
            model: BlogCategory,
            attributes: blogCategoryAttributes,
          },
        },
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

exports.getByUser = async (req, res, next) => {
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
