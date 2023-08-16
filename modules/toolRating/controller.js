"use strict";

const sequelize = require("../../config/db");
const service = require("./service");
const { usersqquery, sqquery } = require("../../utils/query");
const Tool = require("../tool/model");
const User = require("../user/model");

exports.add = async (req, res, next) => {
  try {
    req.body.userId = req.requestor.id;
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
      ...sqquery(req.query),
      attributes: {
        include: [
          [
            sequelize.fn(
              "ROUND",
              sequelize.literal(
                `(SELECT IFNULL(AVG(rating), 0) FROM toolRatings WHERE toolRatings.toolId = tool.id AND deletedAt is null)`
              ),
              1
            ),
            "ratingsAverage",
          ],
        ],
      },
      include: [
        {
          model: User,
          attributes: ["id", "username", "profilePic"],
        },
        {
          model: Tool,
          attributes: ["id", "title", "image", "price", "link"],
        },
      ],
    });

    const responseData = {
      status: "success",
      data: {
        ratingsAverage: 0, // Default value in case no rows are returned
        totalRatings: data.count,
        rows: [],
      },
    };

    if (data.rows.length > 0) {
      responseData.data.ratingsAverage = data.rows[0].dataValues.ratingsAverage;
      responseData.data.rows = data.rows;
    }

    res.status(200).send(responseData);
  } catch (error) {
    next(error);
  }
};

exports.getByUser = async (req, res, next) => {
  try {
    const data = await service.findAndCountAll({
      ...sqquery(req.query),
      attributes: {
        include: [
          [
            sequelize.fn(
              "ROUND",
              sequelize.literal(
                `(SELECT IFNULL(AVG(rating), 0) FROM toolRatings WHERE toolRatings.toolId = tool.id AND deletedAt is null)`
              ),
              1
            ),
            "ratingsAverage",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM toolRatings WHERE toolRatings.toolId = tool.id AND deletedAt is null)`
            ),
            "totalRatings",
          ],
        ],
      },
      include: [
        {
          model: User,
          attributes: ["id", "username", "profilePic"],
        },
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
              // [
              //   sequelize.fn(
              //     "ROUND",
              //     sequelize.literal(
              //       `(SELECT IFNULL(AVG(rating), 0) FROM toolRatings WHERE toolRatings.toolId = tool.id)`
              //     ),
              //     1
              //   ),
              //   "ratingsAverage",
              // ],
              // [
              //   sequelize.literal(
              //     `(SELECT COUNT(*) FROM toolRatings WHERE toolRatings.toolId = tool.id)`
              //   ),
              //   "totalRatings",
              // ],
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
