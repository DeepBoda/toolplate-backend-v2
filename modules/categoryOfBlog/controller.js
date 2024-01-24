"use strict";

const service = require("./service");
const redisService = require("../../utils/redis");
const slugify = require("slugify");
const blogCategoryService = require("../blogCategory/service");
const { usersqquery, sqquery } = require("../../utils/query");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    // Create slug URL based on name
    req.body.slug = slugify(req.body.name, {
      replacement: "-", // Replace spaces with hyphens
      lower: true, // Convert to lowercase
      remove: /[*+~.()'"!:@/?\\[\],{}]/g, // Remove special characters
    });

    const data = await service.create(req.body);
    redisService.del(`blog-categories`);
    redisService.del(`blog-category-sitemap`);

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
    let data = await redisService.get(`blog-categories`);

    // If the categories are not found in the cache
    if (!data) {
      data = await service.findAndCountAll(
        usersqquery({ ...req.query, sort: "name", sortBy: "ASC" })
      );
      redisService.set(`blog-categories`, data);
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
      // attributes: categoryAdminAttributes,
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

    const categories = await service.findAll();

    const categorySlugs = categories.map((c) => ({
      slug: `${url}/blogs/${c.slug}`,
      updatedAt: c.updatedAt,
    }));

    res.status(200).send({ status: "success", data: categorySlugs });
  } catch (error) {
    next(error);
  }
};

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
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
    redisService.del(`blog-categories`);
    redisService.del(`blog-category-sitemap`);
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

    // Wait for the service deletion and start both background deletions
    await Promise.all([
      blogCategoryService.delete({ where: { categoryOfBlogId: id } }),
      redisService.del(`blog-categories`),
      redisService.del(`blog-category-sitemap`),
    ]);

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
