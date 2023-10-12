"use strict";
const { Op, where } = require("sequelize");
const stringSimilarity = require("string-similarity");
const sequelize = require("../../config/db");
const Sequelize = require("sequelize");
const createError = require("http-errors");
const slugify = require("slugify");
const service = require("./service");
const { pushNotificationTopic } = require("../../service/firebase");
const viewService = require("../toolView/service");
const redisService = require("../../utils/redis");
const { usersqquery, sqquery } = require("../../utils/query");
const { toolSize, toolPreviewSize } = require("../../constants");
const { resizeAndUploadImage } = require("../../utils/imageResize");
const {
  toolAttributes,
  tagAttributes,
  categoryAttributes,
  promptToolAttributes,
} = require("../../constants/queryAttributes");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const blogService = require("../blog/service");
const ToolCategory = require("../toolCategory/model");
const toolCategoryService = require("../toolCategory/service");
const Category = require("../category/model");
const ToolTag = require("../toolTag/model");
const toolTagService = require("../toolTag/service");
const Tag = require("../tag/model");
const ToolImage = require("../toolImages/model");
const toolImageService = require("../toolImages/service");
const { suggestTool } = require("../../utils/prompt");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    if (req.files) {
      // Check if Image (logo) uploaded and if got URL
      if (req.files.image) {
        req.body.image = req.files.image[0].location;
      }

      // Check if Videos uploaded and if got URLs
      if (req.files.videos) {
        req.body.videos = req.files.videos.map((el) => el.location);
      }
    }

    // Create slug URL based on title
    req.body.slug = slugify(req.body.title, {
      replacement: "-", // replace spaces with hyphens
      lower: true, // convert to lowercase
      remove: /[*+~()'"!:@/?\\]/g, // Remove special characters
    });
    const { categories, tags, ...bodyData } = req.body;

    // Step 1: Create the new tool entry in the `tool` table
    const tool = await service.create(bodyData);

    // // Send a push notification with the blog title and body
    // const topic =
    //   process.env.NODE_ENV === "production"
    //     ? process.env.TOPIC
    //     : process.env.DEV_TOPIC;
    // const title = tool.title;
    // const body = "Hot on Toolplate- check it now!";
    // const click_action = `tool/${tool.slug}`;
    // pushNotificationTopic(topic, title, body, click_action, 1);

    // Check if Previews uploaded and if got URLs
    if (req.files.previews) {
      const previews = req.files.previews.map((el) => ({
        image: el.location,
        toolId: tool.id,
      }));

      // Bulk insert the records into the ToolImage table
      const toolPreviews = await toolImageService.bulkCreate(previews);
      toolPreviews.forEach((e) => {
        resizeAndUploadImage(toolPreviewSize, e.image, `toolPreview_${e.id}`);
      });
    }

    // Step 2: Get the comma-separated `categories` and `tags` IDs
    const categoryIds = categories.split(",").map(Number);
    const tagIds = tags.split(",").map(Number);

    // Step 3: Add entries in the `toolCategory` table using bulk insert
    const categoryBulkInsertData = categoryIds.map((categoryId) => ({
      toolId: tool.id,
      categoryId,
    }));

    // Step 4: Add entries in the `toolTag` table using bulk insert
    const tagBulkInsertData = tagIds.map((tagId) => ({
      toolId: tool.id,
      tagId,
    }));

    // Use Promise.all to execute bulk inserts concurrently
    await Promise.all([
      toolCategoryService.bulkCreate(categoryBulkInsertData),
      toolTagService.bulkCreate(tagBulkInsertData),
    ]);

    res.status(200).json({
      status: "success",
      data: tool,
    });

    // Resize and upload the tool icons
    resizeAndUploadImage(toolSize, tool.image, `tool_${tool.id}`);
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
          ...query,
          where,
          include: {
            model: Category,
            attributes: categoryAttributes,
          },
        },
        {
          model: ToolTag,
          attributes: ["tagId"],
          include: {
            model: Tag,
            attributes: tagAttributes,
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

exports.getAllForAdmin = async (req, res, next) => {
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
          attributes: ["categoryId"],
          ...query,
          where,
          include: {
            model: Category,
            attributes: categoryAttributes,
          },
        },
        {
          model: ToolTag,
          attributes: ["tagId"],
          include: {
            model: Tag,
            attributes: tagAttributes,
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

exports.getBySlug = async (req, res, next) => {
  try {
    const cacheKey = `tool?slug=${req.params.slug}`;
    let data = await redisService.get(cacheKey);

    if (!data) {
      data = await service.findOne({
        where: {
          slug: req.params.slug,
        },
        include: [
          {
            model: ToolImage,
            attributes: ["id", "image", "alt"],
          },
          {
            model: ToolCategory,
            attributes: ["categoryId"],
            include: {
              model: Category,
              attributes: categoryAttributes,
            },
          },
          {
            model: ToolTag,
            attributes: ["tagId"],
            include: {
              model: Tag,
              attributes: tagAttributes,
            },
          },
        ],
      });

      redisService.set(cacheKey, data);
    }

    service.update(
      { views: sequelize.literal("views + 1") },
      { where: { id: data.id } }
    );

    const view = viewService.create({
      toolId: data.id,
      userId: req.requestor?.id ?? null,
    });
    console.log("tool===<>", data.id);
    console.log("user===<>", req.requestor?.id);
    console.log("view<======>", view);

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};
exports.getDynamicBySlug = async (req, res, next) => {
  try {
    // let data = await redisService.get(`oneTool`);
    // if (!data)
    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findOne({
      where: {
        slug: req.params.slug,
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

exports.search = async (req, res, next) => {
  try {
    const [tools, blogs] = await Promise.all([
      service.findAll({
        where: {
          title: {
            [Op.like]: `${req.query.title}%`,
          },
        },
        attributes: ["id", "image", "title", "description", "slug"],
      }),
      blogService.findAll({
        where: {
          title: {
            [Op.like]: `%${req.query.title}%`,
          },
        },
        attributes: ["id", "image", "title", "description", "slug"],
      }),
    ]);

    res.status(200).send({
      status: "success",
      tools,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

exports.promptSearch = async (req, res, next) => {
  try {
    const searchQuery = req.query.search;

    const ourTools = await service.findAll({
      where: {
        title: {
          [Op.like]: `%${searchQuery}%`,
        },
      },
      attributes: promptToolAttributes,
    });

    if (ourTools.length > 0) {
      res.status(200).send({
        status: "success",
        // promptTools,
        results: ourTools,
      });
    } else {
      // Suggest tools based on the search query
      const promptTools = await suggestTool([searchQuery]);

      // Fetch tools data
      const tools = await service.findAll({
        attributes: promptToolAttributes,
      });

      const toolTitles = tools.map((tool) => tool.title.toLowerCase());

      const results = [];

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

      if (results.length > 0) {
        // Find the categories of the first result
        const categories = await toolCategoryService.findAll({
          where: { toolId: results[0].id },
          attributes: ["categoryId"],
        });

        if (categories.length > 0) {
          const categoryIds = categories.map((category) => category.categoryId);

          // Find related tools with the same category IDs
          const relatedTools = await service.findAll({
            where: {
              id: { [Op.notIn]: results.map((result) => result.id) },
            },
            include: [
              {
                model: ToolCategory,
                where: { categoryId: { [Op.in]: categoryIds } },
              },
            ],
          });

          // Implement your own sorting criteria for related tools
          relatedTools.sort((a, b) => b.views - a.views);

          // Format related tools data
          const formattedRelatedTools = relatedTools.map((tool) => ({
            id: tool.id,
            title: tool.title,
            description: tool.description,
            image: tool.image,
            price: tool.price,
            slug: tool.slug,
          }));

          // Append the related tools to the results
          results.push(...formattedRelatedTools);
        }
      }

      res.status(200).send({
        status: "success",
        // promptTools,
        results,
      });
    }
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
      include: [
        {
          model: ToolImage,
          attributes: ["id", "image", "alt"],
        },
        {
          model: ToolCategory,
          attributes: ["categoryId"],
          include: {
            model: Category,
            attributes: categoryAttributes,
          },
        },
        {
          model: ToolTag,
          attributes: ["tagId"],
          include: {
            model: Tag,
            attributes: tagAttributes,
          },
        },
      ],
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
          attributes: ["categoryId"],
          include: {
            model: Category,
            attributes: categoryAttributes,
          },
        },
        {
          model: ToolTag,
          attributes: ["tagId"],
          include: {
            model: Tag,
            attributes: tagAttributes,
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

    const userId = req.requestor ? req.requestor.id : null;

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
        {
          model: ToolTag,
          attributes: ["tagId"],
          include: {
            model: Tag,
            attributes: tagAttributes,
          },
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

    res.status(200).json({
      status: "success",
      data: mostRelatedTools,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Retrieve the old tool data from the database based on the provided tool ID.
    const oldToolData = await service.findOne({ where: { id } });

    // Check if Image (logo) uploaded and if got URL
    if (req.files?.image) {
      req.body.image = req.files.image[0].location;
      resizeAndUploadImage(toolSize, req.body.image, `tool_${req.params.id}`);
    }

    // Check if Videos uploaded and if got URLs
    if (req.files?.videos) {
      req.body.videos = req.files.videos.map((el) => el.location);
    }

    // Create slug URL based on title
    if (req.body.title) {
      req.body.slug = slugify(req.body.title, {
        replacement: "-", // replace spaces with hyphens
        lower: true, // convert to lowercase
        remove: /[*+~()'"!:@/?\\]/g, // Remove special characters
      });
    }

    const { categories, tags, ...body } = req.body;

    // Update the tool data
    const [affectedRows] = await service.update(body, { where: { id } });

    // Send the response
    res.status(200).json({ status: "success", data: { affectedRows } });

    // Clear Redis cache
    redisService.del(`tool?slug=${oldToolData.slug}`);

    // Handle the file deletion
    if (req.files?.image && oldToolData.image) {
      const filesToDelete = [
        oldToolData.image,
        ...(req.files.videos || []),
        ...(oldToolData.videos || []),
      ];
      deleteFilesFromS3(filesToDelete);
    }

    // Update categories and tags
    const categoryIds = categories.split(",").map(Number);
    const tagIds = tags.split(",").map(Number);

    // Delete old associations
    await Promise.all([
      toolCategoryService.delete({ where: { toolId: id } }),
      toolTagService.delete({ where: { toolId: id } }),
    ]);

    // Create new associations using bulk create operations
    const categoryBulkInsertData = categoryIds.map((categoryId) => ({
      toolId: id,
      categoryId,
    }));
    const tagBulkInsertData = tagIds.map((tagId) => ({ toolId: id, tagId }));

    await Promise.all([
      toolCategoryService.bulkCreate(categoryBulkInsertData),
      toolTagService.bulkCreate(tagBulkInsertData),
    ]);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    // Find the tool to get the file URLs
    const { image, videos } = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

    // Delete the tool entry
    const affectedRows = await service.delete({
      where: {
        id: req.params.id,
      },
    });

    // Delete files from S3 if URLs are present
    const filesToDelete = [];
    if (image) filesToDelete.push(image);
    if (videos) filesToDelete.push(...videos);

    if (filesToDelete.length > 0) deleteFilesFromS3(filesToDelete);

    // Delete associated categories and tags & images.
    await toolCategoryService.delete({
      where: {
        toolId: req.params.id,
      },
    });
    await toolTagService.delete({
      where: {
        toolId: req.params.id,
      },
    });
    await toolImageService.delete({
      where: {
        toolId: req.params.id,
      },
    });

    // Send the response
    res.status(200).send({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    // Handle errors here
    console.error(error);
    next(error);
  }
};

const makeSLug = async (req, res, next) => {
  try {
    const allTool = await service.findAll({
      attributes: ["id", "title"],
    });

    for (let i in allTool) {
      let slug = slugify(allTool[i].title, {
        replacement: "-", // replace spaces with hyphens
        lower: true, // convert to lowercase
        remove: /[*+~()'"!:@/?\\]/g, // Remove special characters
      });
      allTool[i].slug = slug;
      allTool[i].save();
    }
  } catch (error) {
    console.error(error);
  }
};
// makeSLug();
