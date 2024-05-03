"use strict";

const service = require("./service");
const redisService = require("../../utils/redis");
const slugify = require("slugify");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  mainCategoryAdminAttributes,
  categoryAdminAttributes,
  mainCategoryAttributes,
} = require("../../constants/queryAttributes");
const categoryService = require("../category/service");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const Category = require("../category/model");

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
    redisService.del(`main-categories`);
    redisService.del(`main-submit`);

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
    let data = await redisService.get(`main-categories`);

    // If the categories are not found in the cache
    if (!data) {
      data = await service.findAndCountAll({
        attributes: mainCategoryAttributes,
        include: {
          model: Category,
          attributes: ["id", "name", "slug"],
          limit: 4,
        },
        order: [["createdAt", "DESC"]], // Order by createdAt in descending order
      });

      // Cache the fetched data in Redis
      redisService.set(`main-categories`, data);
    }

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllForSubmit = async (req, res, next) => {
  try {
    // Try to retrieve the categories from the Redis cache
    let data = await redisService.get(`main-submit`);

    // If the categories are not found in the cache
    if (!data) {
      data = await service.findAll({
        ...usersqquery({ ...req.query, sort: "name", sortBy: "ASC" }),
        attributes: ["id", "name"],
      });
      redisService.set(`main-submit`, data);
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

    const categorySlugs = categories.map((c) => ({
      slug: `${url}/category/${c.slug}`,
      updatedAt: c.updatedAt, // Assuming updatedAt is a field in your blog model
    }));

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
      attributes: mainCategoryAdminAttributes,
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllSubCategory = async (req, res, next) => {
  try {
    // If the categories is not found in the cache
    const data = await categoryService.findAndCountAll({
      ...sqquery(req.query, { mainCategoryId: req.params.id }, ["name"]),
      attributes: categoryAdminAttributes,
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

exports.getMetadata = async (req, res, next) => {
  try {
    const cacheKey = `main-category?meta=${req.params.slug}`;
    let data = await redisService.get(cacheKey);

    if (!data) {
      data = await service.findOne({
        where: {
          slug: req.params.slug,
        },
        attributes: ["id", "slug", "metaTitle", "metaDescription"],
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
exports.getBySlug = async (req, res, next) => {
  try {
    const cacheKey = `main-category?slug=${req.params.slug}`;
    let data = await redisService.get(cacheKey);

    if (!data) {
      data = await service.findOne({
        where: {
          slug: req.params.slug,
        },
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
    // Clear Redis cache
    redisService.del(`main-category?slug=${oldData?.slug}`);
    redisService.del(`main-category?meta=${oldData?.slug}`);
    redisService.del(`main-categories`);
    redisService.del(`main-submit`);

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
    const data = await service.findOne({ where: { id } });

    // Delete record from the 'service' module and await the response
    const affectedRows = await service.delete({ where: { id } });

    // Wait for the service deletion and start both background deletions
    await Promise.all([
      redisService.del(`main-category?slug=${data.slug}`),
      redisService.del(`main-category?meta=${data.slug}`),
      redisService.del(`main-categories`),
      redisService.del(`main-submit`),
    ]);

    // Delete the file from S3 if an image URL is present
    if (data?.image) deleteFilesFromS3([data.image]);

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
