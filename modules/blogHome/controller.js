"use strict";

const { Op } = require("sequelize");
const service = require("./service");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  AdminAttributes,
  blogAttributes,
  blogAdminAttributes,
  blogCategoryAttributes,
  blogCardAttributes,
} = require("../../constants/queryAttributes");
const Admin = require("../admin/model");
const Blog = require("../blog/model");
const BlogCategory = require("../blogCategory/model");
const CategoryOfBlog = require("../categoryOfBlog/model");
const sequelize = require("../../config/db");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    req.body.AdminId = req.requestor.id;
    const data = await service.create(req.body);

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
    const data = await service.findAndCountAll({
      ...sqquery({ ...req.query, sort: "index", sortBy: "ASC" }),
      include: {
        model: Blog,
        attributes: blogCardAttributes,
        include: [
          {
            model: BlogCategory,
            attributes: ["categoryOfBlogId"],
            include: {
              model: CategoryOfBlog,
              attributes: blogCategoryAttributes,
            },
          },
        ],
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

exports.getAllDynamic = async (req, res, next) => {
  try {
    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery({ ...req.query, sort: "index", sortBy: "ASC" }),
      attributes: ["id", "index", "blogId"],
      include: {
        model: Blog,
        attributes: [
          "id",
          "views",
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

exports.getAllForAdmin = async (req, res, next) => {
  try {
    const data = await service.findAndCountAll({
      ...sqquery({ ...req.query, sort: "index", sortBy: "ASC" }),
      distinct: true, // Add this option to ensure accurate counts
      include: {
        model: Blog,
        attributes: blogAdminAttributes,
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

exports.getById = async (req, res, next) => {
  try {
    const data = await service.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Admin,
          attributes: AdminAttributes,
        },
        {
          model: Blog,
          attributes: blogAttributes,
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

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
    // Update the tool data
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
