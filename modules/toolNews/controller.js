"use strict";
const sequelize = require("../../config/db");
const service = require("./service");
const { usersqquery, sqquery } = require("../../utils/query");
const News = require("../news/model");
const {
  toolAdminAttributes,
  newsAttributes,
  newsCategoryAttributes,
} = require("../../constants/queryAttributes");
const Tool = require("../tool/model");
const NewsCategory = require("../newsCategory/model");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
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
    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(req.query),
      distinct: true, // Add this option to ensure accurate counts
      include: [
        {
          model: News,
          as: "news",
          attributes: [
            ...newsAttributes,
            [
              sequelize.literal(
                `(SELECT COUNT(*) FROM newsWishlists WHERE newsWishlists.newsId = news.id AND newsWishlists.UserId = ${userId}) > 0`
              ),
              "isWishlisted",
            ],
          ],
          include: {
            model: NewsCategory,
            attributes: newsCategoryAttributes,
          },
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
