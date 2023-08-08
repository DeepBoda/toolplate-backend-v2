"use strict";

const service = require("./service");
const { cl } = require("../../utils/service");
const { usersqquery, sqquery } = require("../../utils/query");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
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
      res.status(200).json({
        status: "success",
        message: "Blog removed from wishlist!.",
      });
    } else {
      await service.create(req.body);
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
    const data = await service.findAndCountAll({
      ...sqquery(req.query, {
        userId: req.requestor.id,
      }),
      // where: {
      //   userId: req.requestor.id,
      // },
      include: {
        model: Blog,
        attributes: [
          "id",
          "title",
          "image",
          "description",
          "readTime",
          "createdAt",
        ],
        include: {
          model: BlogCategory,
          attributes: ["id", "blogId", "categoryId"],
          include: {
            model: Category,
            attributes: ["id", "name"],
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
      include: [
        // {
        //   model: User,
        // },
        {
          model: Blog,
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
