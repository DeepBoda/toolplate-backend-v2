"use strict";

const service = require("./service");
const redisService = require("../../utils/redis");
const slugify = require("slugify");
const toolTagService = require("../toolTag/service");
const blogTagService = require("../blogTag/service");
const { usersqquery, sqquery } = require("../../utils/query");
const { tagAdminAttributes } = require("../../constants/queryAttributes");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    // Create slug URL based on name
    req.body.slug = slugify(req.body.name, {
      replacement: "-", // Replace spaces with hyphens
      lower: true, // Convert to lowercase
      remove: /[*+~.()'"!:@/?\\]/g, // Remove special characters
    });

    const data = await service.create(req.body);
    redisService.del(`tags`);

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
    let data = await redisService.get(`tags`);

    // If the tags are not found in the cache, query the service to fetch the data
    if (!data) {
      data = await service.findAndCountAll(usersqquery(req.query));
      redisService.set(`tags`, data);
    }

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

exports.getAllForAdmin = async (req, res, next) => {
  try {
    // If the tags is not found in the cache
    const data = await service.findAndCountAll({
      ...sqquery(req.query, {}, ["name"]),
      attributes: tagAdminAttributes,
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

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
    // Create slug URL based on name
    if (req.body.name) {
      req.body.slug = slugify(req.body.name, {
        replacement: "-", // Replace spaces with hyphens
        lower: true, // Convert to lowercase
        remove: /[*+~.()'"!:@/?\\]/g, // Remove special characters
      });
    }

    // Update the blog data
    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    redisService.del(`tags`);

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
      toolTagService.delete({ where: { tagId: id } }),
      blogTagService.delete({ where: { tagId: id } }),
      redisService.del(`tags`),
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
    const tags = await service.findAll({
      attributes: ["id", "name"],
    });

    for (let i in tags) {
      let slug = slugify(tags[i].name, {
        replacement: "-", // replace spaces with hyphens
        lower: true, // convert to lowercase
        remove: /[*+~()'"!:@/?\\]/g, // Remove special characters
      });
      tags[i].slug = slug;
      tags[i].save();
    }
  } catch (error) {
    console.error(error);
  }
};
// makeSLug();
