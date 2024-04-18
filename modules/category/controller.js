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
const Category = require("./model");
const { Op } = require("sequelize");

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

    req.body.name = req.body.name.trim();

    const data = await service.create(req.body);
    redisService.del(`categories`);
    redisService.del(`main-categories`);
    redisService.del(`category-slugs`);
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

exports.getAllEmpty = async (req, res, next) => {
  try {
    const categoriesWithTools = await toolCategoryService.findAll({
      attributes: ["categoryId"],
      group: ["categoryId"],
    });
    const categoriesWithToolsIds = categoriesWithTools.map((e) => e.categoryId);

    const data = await service.findAndCountAll({
      ...usersqquery({ ...req.query, sort: "name", sortBy: "ASC" }),
      // attributes: ["id", "name"],
      where: {
        id: { [Op.notIn]: categoriesWithToolsIds },
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

    const categorySlugs = categories.flatMap((category) =>
      ["", "/free", "/premium", "/freemium"].map((suffix) => ({
        slug: `${url}/tools/${category.slug}${suffix}`,
        updatedAt: category.updatedAt,
      }))
    );

    res.status(200).send({ status: "success", data: categorySlugs });
  } catch (error) {
    next(error);
  }
};

exports.getSlugsForSitemapFiltered = async (req, res, next) => {
  try {
    // Try to retrieve the categories from the Redis cache
    let data = await redisService.get(`category-slugs`);
    if (!data) {
      const url =
        process.env.NODE_ENV === "production"
          ? process.env.PROD_WEB
          : process.env.DEV_WEB;

      const categories = await service.findAll();

      const categorySlugs = await Promise.all(
        categories.map(async (category) => {
          const toolCategoryCount = await toolCategoryService.count({
            where: { categoryId: category.id },
          });

          if (toolCategoryCount <= 2) {
            return null; // Skip categories with less than 2 tool categories
          }

          const slugs = [
            {
              slug: `${url}/tools/${category.slug}`,
              updatedAt: category.updatedAt,
            },
            {
              slug: `${url}/tools/${category.slug}/free`,
              updatedAt: category.updatedAt,
            },
            {
              slug: `${url}/tools/${category.slug}/premium`,
              updatedAt: category.updatedAt,
            },
            {
              slug: `${url}/tools/${category.slug}/freemium`,
              updatedAt: category.updatedAt,
            },
          ];

          const [freeToolCount, premiumToolCount, freemiumToolCount] =
            await Promise.all([
              toolCategoryService.count({
                where: { categoryId: category.id, "$tool.price$": "Free" },
                include: { model: Tool, attributes: ["id", "price"] },
              }),
              toolCategoryService.count({
                where: { categoryId: category.id, "$tool.price$": "Premium" },
                include: { model: Tool, attributes: ["id", "price"] },
              }),
              toolCategoryService.count({
                where: { categoryId: category.id, "$tool.price$": "Freemium" },
                include: { model: Tool, attributes: ["id", "price"] },
              }),
            ]);

          if (freeToolCount < 2) {
            slugs.splice(1, 1); // Remove the free slug
          }

          if (premiumToolCount < 2) {
            slugs.splice(2, 1); // Remove the premium slug
          }

          if (freemiumToolCount < 2) {
            slugs.splice(3, 1); // Remove the freemium slug
          }

          return slugs;
        })
      );

      // Flatten the array of arrays and filter out null results
      data = categorySlugs.flat().filter((slugs) => slugs !== null);
      redisService.set(`category-slugs`, data);
    }

    res.status(200).send({ status: "success", data: data });
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

exports.getBySlug = async (req, res, next) => {
  try {
    // Try to retrieve the categories from the Redis cache
    let data = await redisService.get(`category-${req.params.slug}`);

    // If the categories are not found in the cache
    if (!data) {
      data = await service.findOne({
        where: {
          slug: req.params.slug,
        },
        attributes: [
          "id",
          "name",
          "slug",
          "overview",
          "bottomOverview",
          "createdAt",
          "image",
        ],
        include: {
          model: MainCategory,
          attributes: ["id", "name", "slug"],
        },
      });
      redisService.set(`category-${req.params.slug}`, data);
    }
    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRelatedCategories = async (req, res, next) => {
  try {
    const cacheKey = `category?related=${req.params.slug}`;
    let data = await redisService.get(cacheKey);

    if (!data) {
      // Try to retrieve the categories from the Redis cache
      const { slug, mainCategoryId } = await service.findOne({
        where: {
          slug: req.params.slug,
        },
      });
      data = await service.findAll({
        where: {
          slug: { [Op.ne]: slug },
          mainCategoryId,
        },
        attributes: ["id", "name", "slug", "image"],
        order: sequelize.random(),
        limit: 4,
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

exports.getByMain = async (req, res, next) => {
  try {
    const { id } = await mainCategoryService.findOne({
      where: { slug: req.body.slug },
    });
    const data = await service.findAll({
      ...sqquery(req.query, {
        mainCategoryId: id,
      }),
      attributes: categoryAttributes,
      include: {
        model: ToolCategory,
        attributes: ["toolId"],
        limit: 3,
        include: {
          model: Tool,
          attributes: toolCardAttributes,
          include: {
            model: ToolCategory,
            attributes: ["categoryId"],
            include: {
              model: Category,
              attributes: ["name", "slug"],
            },
          },
        },
      },
      required: true,
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};
exports.getByMainDynamic = async (req, res, next) => {
  try {
    const userId = req.requestor ? req.requestor.id : null;

    const { id } = await mainCategoryService.findOne({
      where: { slug: req.body.slug },
    });
    const data = await service.findAll({
      ...sqquery(req.query, {
        mainCategoryId: id,
      }),
      attributes: ["id", "createdAt"],
      include: {
        model: ToolCategory,
        attributes: ["toolId"],
        limit: 3,
        include: {
          model: Tool,
          attributes: [
            "id",
            "ratingsAverage",
            [
              sequelize.literal(
                `(SELECT COUNT(*) FROM toolWishlists WHERE toolWishlists.toolId = tool.id AND toolWishlists.UserId = ${userId}) > 0`
              ),
              "isWishlisted",
            ],
          ],
        },
      },
      required: true,
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
    // // Create slug URL based on name
    // if (req.body.name) {
    //   req.body.slug = slugify(req.body.name, {
    //     replacement: "-", // Replace spaces with hyphens
    //     lower: true, // Convert to lowercase
    //     remove: /[*+~.()'"!:@/?\\[\],{}]/g, // Remove special characters
    //   });
    // }

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
    redisService.del(`category-${oldData?.slug}`);
    redisService.del(`categorySitemap`);
    redisService.del(`main-categories`);

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
      redisService.del(`category-slugs`),
      redisService.del(`categorySitemap`),
      redisService.del(`main-categories`),
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
