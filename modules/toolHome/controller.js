"use strict";

const { Op } = require("sequelize");
const service = require("./service");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  AdminAttributes,
  toolAdminAttributes,
  toolCardAttributes,
  categoryAttributes,
} = require("../../constants/queryAttributes");
const Tool = require("../tool/model");
const Admin = require("../admin/model");
const ToolCategory = require("../toolCategory/model");
const Category = require("../category/model");
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
        model: Tool,
        attributes: toolCardAttributes,
        include: [
          {
            model: ToolCategory,
            attributes: ["categoryId"],
            include: {
              model: Category,
              attributes: categoryAttributes,
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
    console.log("tool:userId - ",userId);
    const data = await service.findAndCountAll({
      ...sqquery({ ...req.query, sort: "index", sortBy: "ASC" }),
      attributes: ["id", "index", "toolId"],
      include: {
        model: Tool,
        attributes: [
          "id",
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM toolLikes WHERE toolLikes.toolId = tool.id AND toolLikes.UserId = ${userId}) > 0`
            ),
            "isLiked",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM toolWishlists WHERE toolWishlists.toolId = tool.id AND toolWishlists.UserId = ${userId}) > 0`
            ),
            "isWishlisted",
          ],
          "ratingsAverage",
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
        model: Tool,
        attributes: toolAdminAttributes,
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
          model: Tool,
          attributes: toolAttributes,
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
