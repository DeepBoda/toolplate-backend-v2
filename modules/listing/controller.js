"use strict";
const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const moment = require("moment");
const createError = require("http-errors");
const slugify = require("slugify");
const service = require("./service");
const { pushNotificationTopic } = require("../../service/firebase");
const redisService = require("../../utils/redis");
const viewService = require("../listingView/service");
const { listingResizeImageSize } = require("../../constants");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  listingAttributes,
  listingCategoryAttributes,
  listingAllAdminAttributes,
  toolAdminAttributes,
  listingCategoryAdminAttributes,
  listingToolAttributes,
  categoryAttributes,
} = require("../../constants/queryAttributes");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const ListingCategory = require("../listingCategory/model");
const listingToolService = require("../listingTool/service");
const listingCategoryService = require("../listingCategory/service");
const CategoryOfListing = require("../categoryOfListing/model");
const categoryOfListingService = require("../categoryOfListing/service");
const {
  resizeAndUploadImage,
  resizeAndUploadWebP,
} = require("../../utils/imageResize");
const createHttpError = require("http-errors");
const ListingTool = require("../listingTool/model");
const Tool = require("../tool/model");
const Category = require("../category/model");
const ToolCategory = require("../toolCategory/model");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    // Check if an image file is provided and add the file location to the request body
    if (req.file) {
      req.body.image = req.file.location;
    }

    if (req.body.slug) {
      exist = await service.findOne({
        where: {
          slug: req.body.slug,
        },
      });
      if (exist)
        return res.status(403).send({
          status: "error",
          message: "Oops! slug is already associated with existing listicle.",
        });
    }
    const { categories, tools, ...bodyData } = req.body;
    // Create the new listing entry in the `listing` table
    const listing = await service.create(bodyData);

    // Create the tool-listing-desc entry in the `listingTool` table
    const payload = JSON.parse(tools).map((tool) => ({
      toolId: tool.toolId,
      description: tool.description,
      listingId: listing.id,
      index: tool.index || 0,
    }));
    listingToolService.bulkCreate(payload);

    // // Send a push notification with the listing title and body
    // if (listing.createdAt == listing.release) {
    //   const topic =
    //     process.env.NODE_ENV === "production"
    //       ? process.env.TOPIC
    //       : process.env.DEV_TOPIC;
    //   const title = listing.title;
    //   const body = "Hot on Toolplate- check it now!";
    //   const click_action = `listing/${listing.slug}`;
    //   pushNotificationTopic(topic, title, body, click_action, 1);
    // }

    // Get the comma-separated `categories`  IDs
    const categoryIds = categories.split(",").map(Number);

    // Create an array of objects for bulk insert in `listingCategory` table
    const categoryBulkInsertData = categoryIds.map((categoryId) => ({
      listingId: listing.id,
      categoryOfListingId: categoryId,
    }));
    // Use bulk create operations for `listingCategory`
    listingCategoryService.bulkCreate(categoryBulkInsertData);

    // Send the HTTP response with a success status and the created listing entry
    res.status(200).json({
      status: "success",
      data: listing,
    });

    // Resize and upload the listing image
    resizeAndUploadImage(
      listingResizeImageSize,
      listing.image,
      `listing_${listing.id}`
    );
    resizeAndUploadWebP(
      listingResizeImageSize,
      listing.image,
      `listing_${listing.id}`
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    // let data = await redisService.get(`listings`);
    // if (!data)
    const { categoryIds, ...query } = req.query;

    const where = {};

    if (categoryIds) {
      // Split the comma-separated categoryIds into an array
      const categoryIdArray = categoryIds.split(",").map(Number);

      // Use the `Op.in` operator to find listings that match any of the specified categoryIds
      where["$listingCategories.categoryOfListingId$"] = {
        [Op.in]: categoryIdArray,
      };
    }

    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(query, {}, ["title"]),
      distinct: true, // Add this option to ensure accurate counts
      attributes: [
        ...listingAttributes,
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM listingLikes WHERE listingLikes.listingId = listing.id AND listingLikes.UserId = ${userId}) > 0`
          ),
          "isLiked",
        ],
      ],
      include: [
        {
          model: ListingCategory,
          attributes: ["categoryOfListingId"],
          ...query,
          where,
          include: {
            model: CategoryOfListing,
            attributes: listingCategoryAdminAttributes,
          },
        },
        {
          model: ListingTool,
          attributes: ["id", "description", "toolId", "index"],
          include: {
            model: Tool,
            attributes: toolAdminAttributes,
          },
        },
      ],
    });

    // redisService.set(`listings`, data);

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

      // Use the `Op.in` operator to find listings that match any of the specified categoryIds
      where["$listingCategories.categoryOfListingId$"] = {
        [Op.in]: categoryIdArray,
      };
    }
    const data = await service.findAndCountAll({
      ...sqquery(query, {}, ["title"]),
      distinct: true, // Add this option to ensure accurate counts
      attributes: listingAllAdminAttributes,
      include: {
        model: ListingCategory,
        attributes: ["categoryOfListingId"],
        ...query,
        where,
        include: {
          model: CategoryOfListing,
          attributes: listingCategoryAdminAttributes,
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

exports.getBySlug = async (req, res, next) => {
  try {
    const cacheKey = `listing?slug=${req.params.slug}`;
    let data = await redisService.get(cacheKey);

    if (!data) {
      data = await service.findOne({
        where: {
          slug: req.params.slug,
        },
        include: [
          {
            model: ListingCategory,
            attributes: ["categoryOfListingId"],
            include: {
              model: CategoryOfListing,
              attributes: listingCategoryAttributes,
            },
          },
          {
            model: ListingTool,

            attributes: ["id", "description", "toolId", "index"],
            include: {
              model: Tool,
              attributes: listingToolAttributes,
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
    const category = await categoryOfListingService.findOne({
      where: {
        slug: req.params.slug,
      },
    });

    if (!category) {
      return next(createHttpError(404, "Category not found!"));
    }

    const where = {};

    where["$listingCategories.categoryOfListingId$"] = category.id;

    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(req.query, {}, ["title"]),
      distinct: true, // Add this option to ensure accurate counts
      attributes: [
        ...listingAttributes,
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM listingLikes WHERE listingLikes.listingId = listing.id AND listingLikes.UserId = ${userId}) > 0`
          ),
          "isLiked",
        ],
      ],
      include: [
        {
          model: ListingCategory,
          attributes: ["categoryOfListingId"],
          ...req.query,
          where,
          include: {
            model: CategoryOfListing,
            attributes: listingCategoryAttributes,
          },
        },
        {
          model: ListingTool,

          attributes: ["id", "description", "toolId", "index"],
          include: {
            model: Tool,
            attributes: toolAdminAttributes,
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
    // let data = await redisService.get(`oneListing`);
    // if (!data)
    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findOne({
      where: {
        slug: req.params.slug,
      },
      attributes: [
        ...listingAttributes,
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM listingLikes WHERE listingLikes.listingId = listing.id AND listingLikes.UserId = ${userId}) > 0`
          ),
          "isLiked",
        ],
      ],
    });

    // redisService.set(`oneListing`, data);

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
      listingId: req.params.id,
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

exports.getForAdmin = async (req, res, next) => {
  try {
    // let data = await redisService.get(`oneListing`);
    // if (!data)

    const data = await service.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: ListingCategory,
          attributes: ["categoryOfListingId"],
          include: {
            model: CategoryOfListing,
            attributes: listingCategoryAdminAttributes,
          },
        },
        {
          model: ListingTool,
          attributes: ["id", "description", "toolId", "index"],
          include: {
            model: Tool,
            attributes: toolAdminAttributes,
          },
        },
      ],
    });

    // redisService.set(`oneListing`, data);

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRelatedListings = async (req, res, next) => {
  try {
    const { id } = await service.findOne({ where: { slug: req.params.slug } });
    // console.log("--------------", listing);
    // Find the details of the opened listing
    const openedListing = await service.findOne({
      where: { id },
      attributes: listingAttributes,
      include: {
        model: ListingCategory,
        attributes: ["categoryOfListingId"],
      },
    });

    if (!openedListing) {
      throw createError(404, "Listing not found");
    }

    // Find listings that have the same category as the opened listing
    const categoryIds = openedListing.listingCategories.map(
      (listingCategory) => listingCategory.categoryOfListingId
    );

    const userId = req.requestor ? req.requestor.id : null;
    // Find listings with the same category
    const relatedListings = await service.findAll({
      // ...sqquery(req.query),
      where: {
        id: { [Op.ne]: id },
        "$listingCategories.categoryOfListingId$": { [Op.in]: categoryIds },
      },
      attributes: [
        ...listingAttributes,
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM listingLikes WHERE listingLikes.listingId = listing.id AND listingLikes.UserId = ${userId}) > 0`
          ),
          "isLiked",
        ],
      ],

      include: [
        {
          model: ListingCategory,
          attributes: ["categoryOfListingId"],
          include: {
            model: CategoryOfListing,
            attributes: listingCategoryAttributes,
          },
        },
      ],
    });

    // Calculate matching percentage for each listing
    relatedListings.forEach((listing) => {
      const commonCategories = listing.listingCategories.filter(
        (listingCategory) =>
          categoryIds.includes(listingCategory.categoryOfListingId)
      );

      const totalCategories = categoryIds.length;
      const matchingCategories = commonCategories.length;

      // Calculate matching percentage
      listing.dataValues.matchingPercentage =
        (matchingCategories / totalCategories) * 100;
    });

    // Sort listings based on matching percentage in descending order
    relatedListings.sort(
      (a, b) =>
        b.dataValues.matchingPercentage - a.dataValues.matchingPercentage
    );

    // Limit the result to the top 3 most related listings
    const mostRelatedListings = relatedListings.slice(0, 4);

    // Select only the required attributes (image and title) for each listing
    const reducedData = mostRelatedListings.map(
      (listing) => (
        (listing = listing.toJSON()),
        {
          ...listing,
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

exports.getSlugsForSitemap = async (req, res, next) => {
  try {
    const url =
      process.env.NODE_ENV === "production"
        ? process.env.PROD_WEB
        : process.env.DEV_WEB;

    // If the listings are not found in the cache
    const listings = await service.findAll();

    // Generate array of objects with slug and updatedAt
    const listingSlugs = listings.map((listing) => ({
      slug: `${url}/listing/${listing.slug}`,
      updatedAt: listing.updatedAt, // Assuming updatedAt is a field in your listing model
    }));

    // Send the response
    res.status(200).json({
      status: "success",
      data: listingSlugs,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { file, body } = req;

    // Retrieve the old listing data based on the provided listing ID
    const oldListingData = await service.findOne({ where: { id } });

    // Check if an image is uploaded and update the image property in the request body
    if (file) {
      body.image = file.location;

      // Resize and upload the image (if needed)
      resizeAndUploadImage(
        listingResizeImageSize,
        file.location,
        `listing_${id}`
      );
      resizeAndUploadWebP(
        listingResizeImageSize,
        file.location,
        `listing_${id}`
      );
    }

    if (body.slug) {
      const exist = await service.findOne({
        where: {
          slug: body.slug,
        },
      });
      if (exist && exist.id != id)
        return res.status(403).send({
          status: "error",
          message: "Oops! slug is already associated with existing listing.",
        });
    }

    const { categories, tools, ...updatedData } = body;

    // Update the listing data
    const [affectedRows] = await service.update(updatedData, { where: { id } });

    // Send the response
    res.status(200).json({ status: "success", data: { affectedRows } });

    // Clear Redis cache
    redisService.del(`listing?slug=${oldListingData.slug}`);

    // Delete existing associations with listingTools
    await listingToolService.delete({ where: { listingId: id } });

    // Handle categories  updates
    const categoryIds = categories.split(",").map(Number);

    // Delete existing associations with categories
    await listingCategoryService.delete({ where: { listingId: id } });

    // Create an array of objects for bulk insert in `listingCategory` table
    const categoryBulkInsertData = categoryIds.map((categoryId) => ({
      listingId: id,
      categoryOfListingId: categoryId,
    }));

    // Add listingId to each object in the array
    const payload = JSON.parse(tools).map((tool) => ({
      ...tool,
      listingId: id,
    }));

    // Use bulkCreate with the modified array
    await listingToolService.bulkCreate(payload);

    // Use bulk create operations for `listingCategory` & `listingTool`
    await listingCategoryService.bulkCreate(categoryBulkInsertData);

    // Handle the file deletion
    if (file && oldListingData?.image) {
      deleteFilesFromS3([oldListingData.image]);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    // Find the listing to get the image URL
    const { image } = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

    // Delete the listing entry
    const affectedRows = await service.delete({
      where: {
        id: req.params.id,
      },
    });

    // Delete the file from S3 if an image URL is present
    if (image) deleteFilesFromS3([image]);

    // Delete associated categories
    listingCategoryService.delete({
      where: {
        listingId: req.params.id,
      },
    });
    listingToolService.delete({
      where: {
        listingId: req.params.id,
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
    console.error(error);
    next(error);
  }
};

const makeSLug = async (req, res, next) => {
  try {
    const allListing = await service.findAll({
      attributes: ["id", "title"],
    });

    for (let i in allListing) {
      let slug = slugify(allListing[i].title, {
        replacement: "-", // Replace spaces with hyphens
        lower: true, // Convert to lowercase
        remove: /[*+~.()'"!:@/?\\[\],{}]/g, // Remove special characters
      });
      allListing[i].slug = slug;
      allListing[i].save();
    }
  } catch (error) {
    console.error(error);
  }
};
// makeSLug();
