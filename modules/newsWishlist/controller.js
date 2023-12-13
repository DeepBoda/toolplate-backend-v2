"use strict";

const sequelize = require("../../config/db");
const service = require("./service");
const newsService = require("../news/service");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  userAdminAttributes,
  newsAttributes,
  newsCategoryAttributes,
} = require("../../constants/queryAttributes");
const News = require("../news/model");
const NewsCategory = require("../newsCategory/model");
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
      newsService.update(
        { wishlists: sequelize.literal("wishlists  - 1") },
        { where: { id: req.body.newsId } }
      );

      res.status(200).json({
        status: "success",
        message: "News removed from wishlist!.",
      });
    } else {
      await service.create(req.body);
      newsService.update(
        { wishlists: sequelize.literal("wishlists  + 1") },
        { where: { id: req.body.newsId } }
      );

      res.status(200).json({
        status: "success",
        message: "News added to wishlist!.",
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
      ...sqquery(req.query, {
        userId: req.requestor.id,
      }),
      distinct: true, // Add this option to ensure accurate counts

      include: {
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
          model: News,
          attributes: newsAttributes,
          include: {
            model: NewsCategory,
            attributes: newsCategoryAttributes,
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
    // Update the News data
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
