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
} = require("../../constants/queryAttributes");

exports.add = async (req, res, next) => {
  try {
    req.body.userId = req.requestor.id;
    const exist = await service.findOne({
      where: {
        toolId: req.body.toolId,
        userId: req.body.userId,
      },
    });
    if (exist) {
      res.status(403).json({
        status: "error",
        message: "Hey! You've already left a review for this tool.",
      });
    } else {
      const data = await service.create(req.body);
      toolService.update(
        {
          totalRatings: sequelize.literal(`totalRatings  + 1`),
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
    }
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

exports.getBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    const toolIdQuery = `
      SELECT id
      FROM tools
      WHERE slug = :slug;
    `;

    const [tool] = await sequelize.query(toolIdQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { slug },
    });

    if (!tool || !tool.id) {
      // Handle the case when the tool is not found for the given slug
      return res
        .status(404)
        .json({ status: "error", message: "Tool not found" });
    }

    const toolId = tool.id;

    const ratingsSummaryQuery = `
    SELECT
      COUNT(*) AS totalCount,
      CAST(COALESCE(ROUND(AVG(rating), 1), 0) AS DECIMAL(10,1)) AS averageRating,
      JSON_ARRAY(
        JSON_OBJECT('rating', 5, 'percentage', CAST(COALESCE(SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100, 0) AS SIGNED)),
        JSON_OBJECT('rating', 4, 'percentage', CAST(COALESCE(SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100, 0) AS SIGNED)),
        JSON_OBJECT('rating', 3, 'percentage', CAST(COALESCE(SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100, 0) AS SIGNED)),
        JSON_OBJECT('rating', 2, 'percentage', CAST(COALESCE(SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100, 0) AS SIGNED)),
        JSON_OBJECT('rating', 1, 'percentage', CAST(COALESCE(SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100, 0) AS SIGNED))
      ) AS starRatings
    FROM toolRatings
    WHERE toolId = :toolId
      AND deletedAt IS NULL;
  `;

    const [ratingsSummary] = await sequelize.query(ratingsSummaryQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { toolId },
    });

    const responseData = {
      status: "success",
      data: ratingsSummary,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching tool ratings summary:", error);
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
    const data = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (data) {
      const affectedRows = await service.delete({
        where: {
          id: req.params.id,
        },
      });
      toolService.update(
        {
          totalRatings: sequelize.literal(`totalRatings  - 1`),
          ratingsAverage: sequelize.fn(
            "ROUND",
            sequelize.literal(
              `(SELECT IFNULL(IFNULL(AVG(rating), 0), 0) FROM toolRatings WHERE toolRatings.toolId = tools.id AND deletedAt is null)`
            ),
            1
          ),
        },
        { where: { id: data.toolId } }
      );

      res.status(200).send({
        status: "success",
        data: {
          affectedRows,
        },
      });
    } else {
      // Return a 404 response if the data doesn't exist
      res.status(404).send({
        status: "error",
        message: "Data not found.",
      });
    }
  } catch (error) {
    next(error);
  }
};
