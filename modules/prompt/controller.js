"use strict";

const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const stringSimilarity = require("string-similarity");
const service = require("./service");
const toolService = require("../tool/service");
const redisService = require("../../utils/redis");
const { usersqquery, sqquery } = require("../../utils/query");

const {
  categoryAttributes,
  toolAttributes,
} = require("../../constants/queryAttributes");
const ToolCategory = require("../toolCategory/model");
const Category = require("../category/model");
const { suggestTool } = require("../../utils/prompt");

exports.promptSearch = async (req, res, next) => {
  try {
    const searchQuery = req.query.search;
    const userId = req.requestor ? req.requestor.id : null;

    // Initialize the 'results' array.
    let results = [];

    // Check if the searchQuery is empty or invalid.
    if (!searchQuery) {
      return res.status(400).send({
        status: "error",
        message: "Invalid search query",
      });
    }

    // Create a 'search' record (if needed).
    service.create({
      search: searchQuery,
      userId,
    });

    // Fetch tools from the database.
    let tools = await toolService.findAll({
      attributes: [
        ...toolAttributes,
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM toolWishlists WHERE toolWishlists.toolId = tool.id AND toolWishlists.UserId = ${userId}) > 0`
          ),
          "isWishlisted",
        ],
      ],
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
    });

    const toolTitles = tools.map((tool) => tool.title.toLowerCase());

    // Calculate similarity scores for each tool title.
    const matches = toolTitles.map((title, index) => ({
      item: tools[index],
      similarity: stringSimilarity.compareTwoStrings(
        searchQuery.toLowerCase(),
        title
      ),
    }));

    // Filter matches with similarity > 0.6 and add to results.
    results.push(
      ...matches
        .filter((match) => match.similarity > 0.6)
        .map((match) => match.item)
    );

    if (results.length === 0) {
      let promptTools = await redisService.get(`PromptTools=${searchQuery}`);
      if (!promptTools) {
        // Suggest tools based on the search query
        promptTools = await suggestTool([searchQuery]);
      }

      // Find the best matching tool for each prompt
      promptTools.forEach((prompt) => {
        const matches = toolTitles.map((title, index) => ({
          item: tools[index],
          similarity: stringSimilarity.compareTwoStrings(
            prompt.toLowerCase(),
            title
          ),
        }));

        // Filter matches with similarity > 0.5 and add to results, avoiding duplicates.
        const bestMatch = matches.filter((match) => match.similarity > 0.5);

        if (bestMatch) {
          bestMatch.forEach((match) => {
            if (!results.some((result) => result.id === match.item.id)) {
              results.push(match.item);
            }
          });
        }
      });
      if (results.length > 0) {
        redisService.set(`PromptTools=${searchQuery}`, promptTools);
      }

      // Get a unique list of category IDs from the initial tools
      const categoryIds = Array.from(
        new Set(
          results
            .map((tool) => tool.toolCategories.map((c) => c.categoryId))
            .flat()
        )
      );

      if (categoryIds.length > 0) {
        // Find related tools with the same category IDs
        const relatedTools = await toolService.findAll({
          where: {
            id: { [Op.notIn]: results.map((result) => result.id) },
          },
          attributes: [
            ...toolAttributes,
            [
              sequelize.literal(
                `(SELECT COUNT(*) FROM toolWishlists WHERE toolWishlists.toolId = tool.id AND toolWishlists.UserId = ${userId}) > 0`
              ),
              "isWishlisted",
            ],
          ],
          include: [
            {
              model: ToolCategory,
              where: { categoryId: { [Op.in]: categoryIds } },
              attributes: ["categoryId"],
              include: {
                model: Category,
                attributes: categoryAttributes,
              },
            },
          ],
        });

        // Implement your own sorting criteria for related tools
        relatedTools.sort((a, b) => b.views - a.views);

        // Append the related tools to the results
        results.push(...relatedTools);
      }
    }
    // redisService.set(`prompt=${searchQuery}`, results);
    // }
    res.status(200).send({
      status: "success",
      results,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

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
    const data = await service.findAndCountAll(
      sqquery(req.query, {}, ["search"])
    );
    // Send a success response with the retrieved data
    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    // Pass any error to the next middleware function
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
    const { id } = req.params;

    // Delete record from the 'service' module and await the response
    const affectedRows = await service.delete({ where: { id } });

    // Send the response
    res.status(200).json({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    // Pass error to the next middleware
    next(error);
  }
};
