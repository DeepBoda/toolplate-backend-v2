"use strict";

const { Op } = require("sequelize");
const moment = require("moment");
const service = require("./service");
const newsService = require("../news/service");
const redisService = require("../../utils/redis");
const slugify = require("slugify");
const { usersqquery, sqquery } = require("../../utils/query");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const {
  newsCategoryAttributes,
  newsAttributes,
} = require("../../constants/queryAttributes");

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
    redisService.del(`news-categories`);

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
    let data = await redisService.get(`news-categories`);

    // If the categories are not found in the cache
    if (!data) {
      data = await service.findAndCountAll({
        ...usersqquery({ ...req.query, sort: "name", sortBy: "ASC" }),
        attributes: newsCategoryAttributes,
      });
      redisService.set(`news-categories`, data);
    }

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
    // If the categories is not found in the cache
    const data = await service.findAndCountAll({
      ...sqquery(req.query, {}, ["name"]),
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllNews = async (req, res, next) => {
  try {
    // If the categories is not found in the cache
    const data = await newsService.findAndCountAll({
      ...sqquery(
        req.query,
        {
          newsCategoryId: req.params.id,
          release: {
            [Op.lte]: moment(), // Less than or equal to the current date
          },
        },
        ["title"]
      ),
      attributes: newsAttributes,
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllNewsSchedule = async (req, res, next) => {
  try {
    // If the categories is not found in the cache
    const data = await newsService.findAndCountAll({
      ...sqquery(
        req.query,
        {
          newsCategoryId: req.params.id,
          release: {
            [Op.gt]: moment(), // Less than or equal to the current date
          },
        },
        ["title"]
      ),
      attributes: newsAttributes,
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
    const data = await service.findOne({
      where: {
        slug: req.params.slug,
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

exports.getSlugsForSitemap = async (req, res, next) => {
  try {
    const url =
      process.env.NODE_ENV === "production"
        ? process.env.PROD_WEB
        : process.env.DEV_WEB;

    // If the categories are not found in the cache
    const categories = await service.findAll();

    // Generate array of objects with slug and updatedAt
    const categorySlugs = categories.map((c) => ({
      slug: `${url}/blog/${c.slug}`,
      updatedAt: c.updatedAt, // Assuming updatedAt is a field in your blog model
    }));

    // Send the response
    res.status(200).json({
      status: "success",
      data: categorySlugs,
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
    redisService.del(`news-categories`);

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
    // Find the news to get the image URL
    const { image } = await service.findOne({
      where: {
        id,
      },
    });

    // Delete record from the 'service' module and await the response
    const affectedRows = await service.delete({ where: { id } });

    // Check if affectedRows is zero and return a meaningful response
    if (affectedRows === 0) {
      res.status(404).send({
        status: "error",
        message: "No record found with the given id.",
      });
    } else {
      // Delete the file from S3 if an image URL is present
      if (image) deleteFilesFromS3([image]);

      newsService.delete({ where: { newsCategoryId: id } });
      redisService.del(`news-categories`);

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
