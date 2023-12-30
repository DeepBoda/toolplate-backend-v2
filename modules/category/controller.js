"use strict";

const service = require("./service");
const redisService = require("../../utils/redis");
const slugify = require("slugify");
const toolCategoryService = require("../toolCategory/service");
const mainCategoryService = require("../mainCategory/service");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  toolCardAttributes,
  categoryAttributes,
} = require("../../constants/queryAttributes");
const MainCategory = require("../mainCategory/model");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const ToolCategory = require("../toolCategory/model");
const Tool = require("../tool/model");
const sequelize = require("../../config/db");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    // Check if an image file is provided and add the file location to the request body
    if (req.file) {
      req.body.image = req.file.location;
    }

    // Create slug URL based on name
    req.body.slug = slugify(req.body.name, {
      replacement: "-", // Replace spaces with hyphens
      lower: true, // Convert to lowercase
      remove: /[*+~.()'"!:@/?\\[\],{}]/g, // Remove special characters
    });

    const data = await service.create(req.body);
    redisService.del(`categories`);
    redisService.del(`categorySitemap`);

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
    // Try to retrieve the categories from the Redis cache
    let data = await redisService.get(`categories`);

    // If the categories are not found in the cache
    if (!data) {
      data = await service.findAndCountAll(
        usersqquery({ ...req.query, sort: "name", sortBy: "ASC" })
      );
      redisService.set(`categories`, data);
    }

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSitemap = async (req, res, next) => {
  try {
    // Try to retrieve the categories from the Redis cache
    let data = await redisService.get(`categorySitemap`);
    if (!data) {
      const url =
        process.env.NODE_ENV === "production"
          ? process.env.PROD_WEB
          : process.env.DEV_WEB;

      // If the categories are not found in the cache
      const categories = await service.findAll(
        usersqquery({ ...req.query, sort: "name", sortBy: "ASC" })
      );

      data = {};

      // Group the data by the first letter of the category name
      categories.forEach((category) => {
        const key = category.name.charAt(0).toUpperCase();
        if (!data[key]) {
          data[key] = [];
        }
        data[key].push([
          {
            title: category.name + " Tools",
            url: `${url}/tools/${category.slug}`,
          },
          {
            title: "Free " + category.name + " Tools",
            url: `${url}/tools/${category.slug}/free`,
          },
          {
            title: "Paid " + category.name + " Tools",
            url: `${url}/tools/${category.slug}/premium`,
          },
          {
            title: "Freemium " + category.name + " Tools",
            url: `${url}/tools/${category.slug}/freemium`,
          },
        ]);
      });
      redisService.set(`categorySitemap`, data);
    }

    res.status(200).send({
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

    const categories = await service.findAll();

    const categorySlugs = categories.flatMap((category) => [
      `${url}/tools/${category.slug}`,
      `${url}/tools/${category.slug}/free`,
      `${url}/tools/${category.slug}/premium`,
      `${url}/tools/${category.slug}/freemium`,
    ]);

    res.status(200).send({ status: "success", data: categorySlugs });
  } catch (error) {
    next(error);
  }
};

exports.getAllForAdmin = async (req, res, next) => {
  try {
    // If the categories is not found in the cache
    const data = await service.findAndCountAll({
      ...sqquery(req.query, {}, ["name"]),
      // attributes: categoryAdminAttributes,
      include: {
        model: MainCategory,
        attributes: ["id", "name"],
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
exports.getByMain = async (req, res, next) => {
  try {
    const userId = req.requestor ? req.requestor.id : null;
    const { id } = await mainCategoryService.findOne({ slug: req.body.slug });
    const data = await service.findAll({
      ...sqquery(req.query, {
        mainCategoryId: id,
      }),
      distinct: true, // Add this option to ensure accurate counts
      attributes: categoryAttributes,
      include: {
        model: ToolCategory,
        attributes: ["toolId"],
        limit: 3,
        include: {
          model: Tool,
          attributes: [
            ...toolCardAttributes,
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
    let oldData;
    if (req.file) {
      req.body.image = req.file.location;
      oldData = await service.findOne({ where: { id: req.params.id } });
    }
    // Create slug URL based on name
    if (req.body.name) {
      req.body.slug = slugify(req.body.name, {
        replacement: "-", // Replace spaces with hyphens
        lower: true, // Convert to lowercase
        remove: /[*+~.()'"!:@/?\\[\],{}]/g, // Remove special characters
      });
    }

    // Update the blog data
    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (req.file && oldData?.image) {
      deleteFilesFromS3([oldData.image]);
    }
    redisService.del(`categories`);
    redisService.del(`categorySitemap`);
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

    // Find the blog to get the image URL
    const { image } = await service.findOne({ where: { id } });

    // Delete record from the 'service' module and await the response
    const affectedRows = await service.delete({ where: { id } });

    // Wait for the service deletion and start both background deletions
    await Promise.all([
      toolCategoryService.delete({ where: { categoryId: id } }),
      redisService.del(`categories`),
      redisService.del(`categorySitemap`),
    ]);

    // Delete the file from S3 if an image URL is present
    if (image) deleteFilesFromS3([image]);

    // Check if affectedRows is zero and return a meaningful response
    if (affectedRows === 0) {
      res.status(404).send({
        status: "error",
        message: "No record found with the given id.",
      });
    } else {
      // Send response with the number of affected rows
      res.status(200).send({
        status: "success",
        data: {
          affectedRows,
        },
      });
    }
  } catch (error) {
    // Pass error to the next middleware
    next(error);
  }
};

const makeSLug = async (req, res, next) => {
  try {
    const categories = await service.findAll({
      attributes: ["id", "name"],
    });

    for (let i in categories) {
      let slug = slugify(categories[i].name, {
        replacement: "-", // replace spaces with hyphens
        lower: true, // convert to lowercase
        remove: /[*+~()'"!:@/?\\]/g, // Remove special characters
      });
      categories[i].slug = slug;
      categories[i].save();
    }
  } catch (error) {
    console.error(error);
  }
};
// makeSLug();
