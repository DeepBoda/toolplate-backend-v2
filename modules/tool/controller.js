"use strict";
const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const moment = require("moment");
const createError = require("http-errors");
const slugify = require("slugify");
const service = require("./service");
const { pushNotificationTopic } = require("../../service/firebase");
const redisService = require("../../utils/redis");
const seoService = require("../toolSeo/service");
const viewService = require("../toolView/service");
const { usersqquery, sqquery } = require("../../utils/query");
const { toolSize, toolPreviewSize } = require("../../constants");
const {
  resizeAndUploadImage,
  resizeAndUploadWebP,
} = require("../../utils/imageResize");
const {
  toolAttributes,
  categoryAttributes,
  toolAllAdminAttributes,
} = require("../../constants/queryAttributes");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const blogService = require("../blog/service");
const categoryService = require("../category/service");
const ToolCategory = require("../toolCategory/model");
const toolCategoryService = require("../toolCategory/service");
const Category = require("../category/model");
const ToolImage = require("../toolImages/model");
const toolImageService = require("../toolImages/service");
const createHttpError = require("http-errors");
const MainCategory = require("../mainCategory/model");

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
    const { categories, ...bodyData } = req.body;

    // Step 1: Create the new tool entry in the `tool` table
    const tool = await service.create(bodyData);
    console.log("tool", tool);
    // // Send a push notification with the blog title and body
    // if (blog.createdAt == blog.release) {
    // const topic =
    //   process.env.NODE_ENV === "production"
    //     ? process.env.TOPIC
    //     : process.env.DEV_TOPIC;
    // const title = tool.title;
    // const body = "Hot on Toolplate- check it now!";
    // const click_action = `tool/${tool.slug}`;
    // pushNotificationTopic(topic, title, body, click_action, 1);
    // }

    // Check if Previews uploaded and if got URLs
    if (req.files.previews) {
      const previews = req.files.previews.map((el) => ({
        image: el.location,
        toolId: tool.id,
      }));

      // Bulk insert the records into the ToolImage table
      await toolImageService.bulkCreate(previews);

      // const toolPreviews = await toolImageService.bulkCreate(previews);
      // toolPreviews.forEach((e) => {
      //   resizeAndUploadImage(toolPreviewSize, e.image, `toolPreview_${e.id}`);
      //   resizeAndUploadWebP(toolPreviewSize, e.image, `toolPreview_${e.id}`);
      // });
    }

    // Step 2: Get the comma-separated `categories` IDs
    const categoryIds = categories.split(",").map(Number);

    const cats = await categoryService.findAll({
      where: {
        id: { [Op.in]: categoryIds },
      },
    });

    // Step 3: Add entries in the `toolCategory` table using bulk insert
    const categoryBulkInsertData = categoryIds.map((categoryId) => ({
      toolId: tool.id,
      categoryId,
    }));

    //  execute bulk inserts concurrently
    toolCategoryService.bulkCreate(categoryBulkInsertData);

    // Extract category names using map
    const categoryNames = cats.map((category) => category.name).join(" and ");
    const seoData = {
      toolId: tool.id,
      title: `${tool.title} AI - Key Features, Reviews, Pricing, & Alternative Tools`,
      description: `Explore ${tool.title} on Toolplate: a ${(tool.price =
        "premium"
          ? "Paid"
          : tool.price)} ${categoryNames} tool: Read in-depth features and details, user reviews, pricing, and find alternative tools of ${
        tool.title
      }. Your one-stop resource for ${tool.title} insights`,
    };
    seoService.create(seoData);

    res.status(200).json({
      status: "success",
      data: tool,
    });

    // Resize and upload the tool icons
    resizeAndUploadImage(toolSize, tool.image, `tool_${tool.id}`);
    resizeAndUploadWebP(toolSize, tool.image, `tool_${tool.id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    // let data = await redisService.get(`tools`);
    // if (!data)
    const { categoryIds, price, ...query } = req.query;

    if (price && !["Free", "Freemium", "Premium"].includes(price)) {
      return next(createHttpError(404, "Invalid value , route not found!"));
    }

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

    // Dynamically create conditions based on the selected price
    const priceConditions = {
      Free: { [Op.in]: ["Free", "Freemium"] },
      Freemium: { [Op.in]: ["Freemium"] },
      Premium: { [Op.in]: ["Freemium", "Premium"] },
    };
    const priceFilter = price ? { price: priceConditions[price] } : undefined;

    const data = await service.findAndCountAll({
      ...sqquery(
        query,
        {
          release: {
            [Op.lte]: moment(), // Less than or equal to the current date
          },
          ...priceFilter,
        },
        ["title"]
      ),
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

    const data = await service.findAndCountAll({
      ...sqquery(
        query,
        {
          release: {
            [Op.lte]: moment(), // Less than or equal to the current date
          },
        },
        ["title"]
      ),
      distinct: true, // Add this option to ensure accurate counts
      attributes: toolAllAdminAttributes,
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

exports.getAllForNews = async (req, res, next) => {
  try {
    const data = await service.findAll({
      ...usersqquery({ ...req.query, sort: "title", sortBy: "ASC" }),
      distinct: true, // Add this option to ensure accurate counts
      attributes: ["id", "title"],
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getScheduledForAdmin = async (req, res, next) => {
  try {
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

    const data = await service.findAndCountAll({
      ...sqquery(
        query,
        {
          release: {
            [Op.gt]: moment(), // Less than or equal to the current date
          },
        },
        ["title"]
      ),
      distinct: true, // Add this option to ensure accurate counts
      attributes: toolAllAdminAttributes,
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
              include: {
                model: MainCategory,
                attributes: ["id", "name"],
              },
            },
          },
        ],
      });

      redisService.set(cacheKey, data);
    }

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getByCategorySlug = async (req, res, next) => {
  try {
    const category = await categoryService.findOne({
      where: {
        slug: req.params.slug,
      },
    });
    if (!category) {
      return next(createHttpError(404, "Category not found!"));
    }
    const { price, ...query } = req.query;

    if (price && !["Free", "Freemium", "Premium"].includes(price)) {
      return next(createHttpError(404, "Invalid value , route not found!"));
    }

    // Dynamically create conditions based on the selected price
    const priceConditions = {
      Free: { [Op.in]: ["Free", "Freemium"] },
      Freemium: { [Op.in]: ["Freemium"] },
      Premium: { [Op.in]: ["Freemium", "Premium"] },
    };
    const priceFilter = price ? { price: priceConditions[price] } : undefined;

    const where = {};

    where["$toolCategories.categoryId$"] = category.id;

    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(
        query,
        {
          release: {
            [Op.lte]: moment(), // Less than or equal to the current date
          },
          ...priceFilter,
        },
        ["title"]
      ),
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

exports.createView = async (req, res, next) => {
  try {
    // Use await with service.update
    service.update(
      { views: sequelize.literal("views + 1") },
      { where: { id: req.params.id } }
    );

    // Create the view record
    viewService.create({
      toolId: req.params.id,
      userId: req.requestor?.id || null,
    });

    // Send the response with a status code of 200 and a success message
    res.status(200).send({
      status: "success",
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
            [Op.like]: `%${req.query.title}%`,
          },
          release: {
            [Op.lte]: moment(), // Less than or equal to the current date
          },
        },
        attributes: ["id", "image", "title", "description", "slug"],
      }),
      blogService.findAll({
        where: {
          title: {
            [Op.like]: `%${req.query.title}%`,
          },
          release: {
            [Op.lte]: moment(), // Less than or equal to the current date
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
      ],
    });

    if (!openedTool) {
      throw createError(404, "Tool not found");
    }

    // Find tools that have the same category as the opened tool
    const categoryIds = openedTool.toolCategories.map(
      (toolCategory) => toolCategory.categoryId
    );

    const userId = req.requestor ? req.requestor.id : null;

    // Find tools with the same category  IDs
    const relatedTools = await service.findAll({
      // ...sqquery(req.query),
      where: {
        id: { [Op.ne]: req.params.id },
        "$toolCategories.categoryId$": { [Op.in]: categoryIds },
        release: {
          [Op.lte]: moment(), // Less than or equal to the current date
        },
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
      ],
    });

    // Calculate matching percentage for each tool
    relatedTools.forEach((tool) => {
      const commonCategories = tool.toolCategories.filter((toolCategory) =>
        categoryIds.includes(toolCategory.categoryId)
      );

      const totalCategories = categoryIds.length;

      const matchingCategories = commonCategories.length;

      // Calculate matching percentage
      tool.dataValues.matchingPercentage =
        (matchingCategories / totalCategories) * 100;
    });

    // Sort tools based on matching percentage in descending order
    relatedTools.sort(
      (a, b) =>
        b.dataValues.matchingPercentage - a.dataValues.matchingPercentage
    );

    // Limit the result to the top 3 most related tools
    const mostRelatedTools = relatedTools.slice(0, 4);

    res.status(200).json({
      status: "success",
      data: mostRelatedTools,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAlternativeTools = async (req, res, next) => {
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
      ],
    });

    if (!openedTool) {
      throw createError(404, "Tool not found");
    }

    // Find tools that have the same category as the opened tool
    const categoryIds = openedTool.toolCategories.map(
      (toolCategory) => toolCategory.categoryId
    );
    const where = {};

    where["$toolCategories.categoryId$"] = { [Op.in]: categoryIds };

    const userId = req.requestor ? req.requestor.id : null;

    // Find tools with the same category  IDs
    const data = await service.findAndCountAll({
      ...sqquery(
        { ...req.query, sort: "views", sortBy: "DESC" },
        {
          id: { [Op.ne]: req.params.id },
          release: {
            [Op.lte]: moment(), // Less than or equal to the current date
          },
        },
        ["title"]
      ),
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
          where,
          include: {
            model: Category,
            attributes: categoryAttributes,
          },
        },
      ],
    });

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAlternativeSchema = async (req, res, next) => {
  try {
    const url =
      process.env.NODE_ENV === "production"
        ? process.env.PROD_WEB
        : process.env.DEV_WEB;

    // Find the details of the opened tool
    const openedTool = await service.findOne({
      where: { slug: req.params.slug },
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

    if (!openedTool) {
      throw createError(404, "Tool not found");
    }

    // Find tools that have the same category as the opened tool
    const categoryIds = openedTool.toolCategories.map(
      (toolCategory) => toolCategory.categoryId
    );
    const where = {};

    where["$toolCategories.categoryId$"] = { [Op.in]: categoryIds };

    const userId = req.requestor ? req.requestor.id : null;

    // Find tools with the same category  IDs
    const alternates = await service.findAll({
      ...sqquery(
        { ...req.query, sort: "views", sortBy: "DESC" },
        {
          slug: { [Op.ne]: req.params.slug },
          release: {
            [Op.lte]: moment(), // Less than or equal to the current date
          },
        },
        ["title"]
      ),
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
          where,
          include: {
            model: Category,
            attributes: categoryAttributes,
          },
        },
      ],
    });

    const data = alternates.map((alt) => ({
      name: alt.title,
      url: `${url}/tool/${alt.slug}`,
      image: alt.image,
    }));

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSlugsForSitemap = async (req, res, next) => {
  try {
    const url =
      process.env.NODE_ENV === "production"
        ? process.env.PROD_WEB
        : process.env.DEV_WEB;

    // If the tools are not found in the cache
    const tools = await service.findAll();

    // Generate slugs for each tool
    const toolSlugs = tools.map((tool) => ({
      slug: `${url}/tool/${tool.slug}`,
      updatedAt: tool.updatedAt, // Assuming updatedAt is a field in your blog model
    }));
    // Send the response
    res.status(200).json({
      status: "success",
      data: toolSlugs,
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
      resizeAndUploadWebP(toolSize, req.body.image, `tool_${req.params.id}`);
    }

    // Check if Videos uploaded and if got URLs
    if (req.files?.videos) {
      req.body.videos = req.files.videos.map((el) => el.location);
    }

    // if (req.body.slug) {
    //   const exist = await service.findOne({
    //     where: {
    //       slug: req.body.slug,
    //     },
    //   });
    //   if (exist && exist.id != id)
    //     return res.status(403).send({
    //       status: "error",
    //       message: "Oops! slug is already associated with existing tool.",
    //     });
    // }

    const { categories, ...body } = req.body;

    // Update the tool data
    const [affectedRows] = await service.update(body, { where: { id } });

    // Send the response
    res.status(200).json({ status: "success", data: { affectedRows } });

    // Clear Redis cache
    redisService.del(`tool?slug=${oldToolData.slug}`);
    redisService.del(`toolsForPrompt`);
    redisService.hDel(`prompt=*`);

    // Handle the file deletion
    if (req.files?.image && oldToolData.image) {
      const filesToDelete = [
        oldToolData.image,
        ...(req.files.videos || []),
        ...(oldToolData.videos || []),
      ];
      deleteFilesFromS3(filesToDelete);
    }

    // Update categories
    const categoryIds = categories.split(",").map(Number);

    const cats = await categoryService.findAll({
      where: {
        id: { [Op.in]: categoryIds },
      },
    });

    // Delete old associations
    await toolCategoryService.delete({ where: { toolId: id } });

    // Create new associations using bulk create operations
    const categoryBulkInsertData = categoryIds.map((categoryId) => ({
      toolId: id,
      categoryId,
    }));

    //  execute bulk inserts concurrently
    toolCategoryService.bulkCreate(categoryBulkInsertData);

    // Extract category names using map
    const categoryNames = cats.map((category) => category.name).join(" and ");
    const seoData = {
      // title: `${req.body.title} AI - Key Features, Reviews, Pricing, & Alternative Tools`,
      description: `Explore ${req.body.title} on Toolplate: a ${req.body.price} ${categoryNames} tool: Read in-depth features and details, user reviews, pricing, and find alternative tools of ${req.body.title}. Your one-stop resource for ${req.body.title} insights`,
    };
    seoService.update(seoData, {
      where: {
        toolId: id,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const toolId = req.params.id;
    const toolData = await service.findOne({ where: { id: toolId } });

    if (!toolData) {
      return res
        .status(404)
        .send({ status: "error", message: "Tool not found" });
    }

    const [affectedRows] = await Promise.all([
      service.delete({ where: { id: toolId } }),
      toolCategoryService.delete({ where: { toolId } }),
      toolImageService.delete({ where: { toolId } }),
    ]);

    const filesToDelete = [];
    if (toolData.image) filesToDelete.push(toolData.image);
    if (toolData.videos) filesToDelete.push(...toolData.videos);

    res.status(200).send({
      status: "success",
      data: { affectedRows },
    });

    if (filesToDelete.length > 0) {
      deleteFilesFromS3(filesToDelete);
    }

    // Clear Redis cache
    redisService.del(`toolsForPrompt`);
    redisService.hDel(`prompt=*`);
  } catch (error) {
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
