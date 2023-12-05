"use strict";

const sequelize = require("../../config/db");
const service = require("./service");
const redisService = require("../../utils/redis");
const toolService = require("../tool/service");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  toolAttributes,
  categoryAttributes,
  userAdminAttributes,
  toolAdminAttributes,
} = require("../../constants/queryAttributes");
const Tool = require("../tool/model");
const ToolCategory = require("../toolCategory/model");
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
      toolService.update(
        { wishlists: sequelize.literal("wishlists  - 1") },
        { where: { id: req.body.toolId } }
      );

      res.status(200).json({
        status: "success",
        message: "Tool removed from wishlist!.",
      });
    } else {
      await service.create(req.body);
      toolService.update(
        { wishlists: sequelize.literal("wishlists  + 1") },
        { where: { id: req.body.toolId } }
      );

      res.status(200).json({
        status: "success",
        message: "Tool added to wishlist!.",
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
        // ["$tools.title$"]
      ),
      distinct: true, // Add this option to ensure accurate counts

      include: {
        model: Tool,
        as: "tool",
        attributes: [
          ...toolAttributes,
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
        ],
        include: {
          model: ToolCategory,
          attributes: ["id", "toolId", "categoryId"],
          include: {
            model: Category,
            attributes: categoryAttributes,
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
          model: Tool,
          attributes: toolAdminAttributes,
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
    // Update the Tool data
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
