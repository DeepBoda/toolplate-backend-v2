"use strict";
const { Op, where } = require("sequelize");
const sequelize = require("../../config/db");
const service = require("./service");
const viewService = require("../toolView/service");
// const redisService = require("../../utils/redis");

const { usersqquery, sqquery } = require("../../utils/query");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const ToolCategory = require("../toolCategory/model");
const toolCategoryService = require("../toolCategory/service");
const Category = require("../category/model");
const ToolTag = require("../toolTag/model");
const toolTagService = require("../toolTag/service");
const Tag = require("../tag/model");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    if (req.files) {
      // Check if Image (logo) uploaded and if got URL
      if (req.files.image) {
        req.body.image = req.files.image[0].location;
      }
      // Check if Previews uploaded and if got URLs
      if (req.files.previews) {
        const previews = req.files.previews.map((el) => el.location);
        req.body.previews = previews;
      }
      // Check if Videos uploaded and if got URLs
      if (req.files.videos) {
        const videos = req.files.videos.map((el) => el.location);
        req.body.videos = videos;
      }
    }

    const { categories, tags, ...body } = req.body;
    console.log("body: ", body);

    // Step 1: Create the new tool entry in the `tool` table
    const tool = await service.create(body);

    // Step 2: Get the comma-separated `categories` and `tags` IDs
    const categoryIds = categories
      .split(",")
      .map((categoryId) => parseInt(categoryId));
    const tagIds = tags.split(",").map((tagId) => parseInt(tagId));

    // Step 3: Add entries in the `toolCategory` table
    for (const categoryId of categoryIds) {
      await toolCategoryService.create({
        toolId: tool.id,
        categoryId,
      });
    }

    // Step 4: Add entries in the `toolTag` table
    for (const tagId of tagIds) {
      await toolTagService.create({
        toolId: tool.id,
        tagId,
      });
    }

    res.status(200).json({
      status: "success",
      data: tool,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    // let data = await redisService.get(`tools`);
    // if (!data)
    const { categoryIds, ...query } = req.query;

    const where = {};

    if (categoryIds) {
      // Split the comma-separated categoryIds into an array
      const categoryIdArray = categoryIds.split(",").map(Number);

      // Use the `Op.in` operator to find tools that match any of the specified categoryIds
      where["$toolCategories.categoryId$"] = {
        [Op.in]: categoryIdArray,
      };
    }
    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(query, {}, ["title"]),
      distinct: true, // Add this option to ensure accurate counts
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
      },
      include: [
        {
          model: ToolCategory,
          attributes: ["id", "toolId", "categoryId"],
          ...query,
          where,
          include: {
            model: Category,
            attributes: ["id", "name"],
          },
        },
        {
          model: ToolTag,
          attributes: ["id", "toolId", "tagId"],
          include: {
            model: Tag,
            attributes: ["id", "name"],
          },
        },
      ],
    });

    // redisService.set(`tools`, data);

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
    // let data = await redisService.get(`oneTool`);
    // if (!data)
    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findOne({
      where: {
        id: req.params.id,
      },
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
      },
      include: [
        {
          model: ToolCategory,
          attributes: ["id", "toolId", "categoryId"],
          include: {
            model: Category,
            attributes: ["id", "name"],
          },
        },
        {
          model: ToolTag,
          attributes: ["id", "toolId", "tagId"],
          include: {
            model: Tag,
            attributes: ["id", "name"],
          },
        },
      ],
    });
    await viewService.create({
      toolId: req.params.id,
      userId: req.requestor?.id ?? null,
    });
    // redisService.set(`oneTool`, data);

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getForAdmin = async (req, res, next) => {
  try {
    // let data = await redisService.get(`oneTool`);
    // if (!data)

    const data = await service.findOne({
      where: {
        id: req.params.id,
      },
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
        ],
      },
      include: [
        {
          model: ToolCategory,
          attributes: ["id", "toolId", "categoryId"],
          include: {
            model: Category,
            attributes: ["id", "name"],
          },
        },
        {
          model: ToolTag,
          attributes: ["id", "toolId", "tagId"],
          include: {
            model: Tag,
            attributes: ["id", "name"],
          },
        },
      ],
    });
    await viewService.create({
      toolId: req.params.id,
      userId: null,
    });
    // redisService.set(`oneTool`, data);

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRelatedTools = async (req, res, next) => {
  try {
    // Find the details of the opened tool
    const openedTool = await service.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: ToolCategory,
          include: {
            model: Category,
          },
        },
        {
          model: ToolTag,
          include: {
            model: Tag,
          },
        },
      ],
    });

    if (!openedTool) {
      throw createError(404, "Tool not found");
    }

    // Find tools that have the same category as the opened tool
    const categoryIds = openedTool.toolCategories.map(
      (toolCategory) => toolCategory.categoryId
    );

    // Find tools that have the same tags as the opened tool
    const tagIds = openedTool.toolTags.map((toolTag) => toolTag.tagId);

    // Find tools with the same category or tag IDs
    const relatedTools = await service.findAll({
      // ...sqquery(req.query),
      where: {
        id: { [Op.ne]: req.params.id },
        [Op.or]: [
          { "$toolCategories.categoryId$": { [Op.in]: categoryIds } },
          { "$toolTags.tagId$": { [Op.in]: tagIds } },
        ],
      },
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM `toolViews` WHERE `tool`.`id` = `toolViews`.`toolId` )"
            ),
            "views",
          ],
        ],
      },
      include: [
        {
          model: ToolCategory,
          attributes: ["id", "toolId", "categoryId"],
          include: {
            model: Category,
          },
        },
        {
          model: ToolTag,
          attributes: ["id", "toolId", "tagId"],
        },
      ],
    });

    // Calculate matching percentage for each tool
    relatedTools.forEach((tool) => {
      const commonCategories = tool.toolCategories.filter((toolCategory) =>
        categoryIds.includes(toolCategory.categoryId)
      );
      const commonTags = tool.toolTags.filter((toolTag) =>
        tagIds.includes(toolTag.tagId)
      );
      const totalCategories = categoryIds.length;
      const totalTags = tagIds.length;
      const matchingCategories = commonCategories.length;
      const matchingTags = commonTags.length;

      // Calculate matching percentage
      tool.dataValues.matchingPercentage =
        ((matchingCategories + matchingTags) / (totalCategories + totalTags)) *
        100;
    });

    // Sort tools based on matching percentage in descending order
    relatedTools.sort(
      (a, b) =>
        b.dataValues.matchingPercentage - a.dataValues.matchingPercentage
    );

    // Limit the result to the top 3 most related tools
    const mostRelatedTools = relatedTools.slice(0, 3);
    // console.log(mostRelatedTools);

    // Select only the required attributes (image and title) for each tool
    const reducedData = mostRelatedTools.map(
      (tool) => (
        (tool = tool.toJSON()),
        {
          id: tool.id,
          title: tool.title,
          description: tool.description,
          price: tool.price,
          image: tool.image,
          category: tool.toolCategories.map(
            (category) => category.category.name
          ),
          views: tool.views,
        }
      )
    );

    res.status(200).json({
      status: "success",
      data: reducedData,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
    let oldToolData;
    if (req.file) {
      req.body.image = req.file.location;
      oldToolData = await service.findOne({
        where: {
          id: req.params.id,
        },
      });
    }

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

    // Handle the file deletion
    if (req.file && oldToolData?.image) deleteFilesFromS3([oldToolData?.image]);
  } catch (error) {
    // Handle errors here
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    // If a image URL is present, delete the file from S3
    const { image } = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

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
    // Handle the file deletion
    if (image) deleteFilesFromS3([image]);
  } catch (error) {
    next(error);
  }
};
