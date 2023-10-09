"use strict";

const sequelize = require("../../config/db");
const service = require("./service");
const toolService = require("../tool/service");
const { usersqquery, sqquery } = require("../../utils/query");
const Tool = require("../tool/model");
const User = require("../user/model");
const {
  userAdminAttributes,
  toolAdminAttributes,
  ratingsAdminAttributes,
} = require("../../constants/queryAttributes");

exports.add = async (req, res, next) => {
  try {
    req.body.userId = req.requestor.id;
    const data = await service.create(req.body);
    toolService.update(
      {
        totalRatings: sequelize.literal("totalRatings  + 1"),
        ratingsAverage: sequelize.fn(
          "ROUND",
          sequelize.literal(
            `(SELECT IFNULL(IFNULL(AVG(rating), 0), 0) FROM toolRatings WHERE toolRatings.toolId = tools.id AND deletedAt is null)`
          ),
          1
        ),
      },
      { where: { id: req.body.toolId } }
    );

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
          attributes: userAdminAttributes,
        },
        {
          model: Tool,
          attributes: toolAdminAttributes,
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

exports.getAllForAdmin = async (req, res, next) => {
  try {
    const data = await service.findAndCountAll({
      ...sqquery(req.query),
      attributes: [
        ...ratingsAdminAttributes,
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
