"use strict";

const sequelize = require("../../config/db");
const service = require("./service");
const { usersqquery, sqquery } = require("../../utils/query");
const Tool = require("../tool/model");
const ToolCategory = require("../toolCategory/model");
const Category = require("../category/model");

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
        message: "Tool removed from wishlist!.",
      });
    } else {
      await service.create(req.body);
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
    const data = await service.findAndCountAll({
      ...sqquery(
        req.query,
        {
          userId: req.requestor.id,
        },
        ["$tools.title$"]
      ),
      distinct: true, // Add this option to ensure accurate counts

      include: {
        model: Tool,
        as: "tool",
        attributes: [
          "id",
          "title",
          "image",
          "description",
          "price",
          "createdAt",
          [
            sequelize.fn(
              "ROUND",
              sequelize.literal(
                `(SELECT IFNULL(AVG(rating), 0) FROM toolRatings WHERE toolRatings.toolId = tool.id)`
              ),
              1
            ),
            "ratingsAverage",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM toolRatings WHERE toolRatings.toolId = tool.id)`
            ),
            "totalRatings",
          ],
        ],
        include: {
          model: ToolCategory,
          attributes: ["id", "toolId", "categoryId"],
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
      distinct: true, // Add this option to ensure accurate counts
      include: [
        // {
        //   model: User,
        // },
        {
          model: Tool,
          attributes: {
            include: [
              [
                sequelize.literal(
                  "(SELECT COUNT(*) FROM `toolViews` WHERE `tool`.`id` = `toolViews`.`toolId` )"
                ),
                "views",
              ],
              [
                sequelize.literal(
                  "(SELECT COUNT(*) FROM `toolLikes` WHERE `tool`.`id` = `toolLikes`.`toolId` )"
                ),
                "likes",
              ],
              [
                sequelize.literal(
                  "(SELECT COUNT(*) FROM `toolWishlists` WHERE `tool`.`id` = `toolWishlists`.`toolId` )"
                ),
                "wishlists",
              ],
              [
                sequelize.fn(
                  "ROUND",
                  sequelize.literal(
                    `(SELECT IFNULL(AVG(rating), 0) FROM toolRatings WHERE toolRatings.toolId = tool.id)`
                  ),
                  1
                ),
                "ratingsAverage",
              ],
              [
                sequelize.literal(
                  `(SELECT COUNT(*) FROM toolRatings WHERE toolRatings.toolId = tool.id)`
                ),
                "totalRatings",
              ],
            ],
          },
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
