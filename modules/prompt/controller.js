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

    // let results = await redisService.get(`prompt=${searchQuery}`);
    // if (!results) {
    service.create({
      search: searchQuery,
      userId,
    });

    // let tools = await redisService.get(`toolsForPrompt`);
    // if (!tools) {
    let tools = await toolService.findAll({
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
    // redisService.set(`toolsForPrompt`, tools);
    // }

    const toolTitles = tools.map((tool) => tool.title.toLowerCase());
    const results = [];

    toolTitles.forEach((title, index) => {
      const similarity = stringSimilarity.compareTwoStrings(
        searchQuery.toLowerCase(),
        title
      );

      if (similarity >= 0.7) {
        results.push(tools[index]);
      }
    });

    if (results.length === 0) {
      let promptTools = await redisService.get(`PromptTools=${searchQuery}`);
      if (!promptTools) {
        // Suggest tools based on the search query
        promptTools = await suggestTool([searchQuery]);
        redisService.set(`PromptTools=${searchQuery}`, promptTools);
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

        // Filter matches with similarity >= 0.5
        const bestMatch = matches
          .filter((match) => match.similarity >= 0.5)
          .sort((a, b) => b.similarity - a.similarity);

        // If there are matches, add the first one to the results
        if (bestMatch.length > 0) {
          results.push(bestMatch[0].item);
        }
      });

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
    // Try to retrieve the tags from the Redis cache
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
