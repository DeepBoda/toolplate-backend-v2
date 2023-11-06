"use strict";

const service = require("./service");
const redisService = require("../../utils/redis");
const { usersqquery, sqquery } = require("../../utils/query");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    let [data, created] = await service.findOrCreate({
      where: { blogId: req.params.blogId },
      defaults: req.body,
    });

    if (!created) {
      await service.update(req.body, {
        where: {
          blogId: req.params.blogId,
        },
      });
      data = await service.findOne({
        where: { blogId: req.params.blogId },
      });
    }
    redisService.del(`blogs-seo`);
    redisService.del(`blog?seo=${req.params.blogId}`);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    // Handle other errors
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    // Try to retrieve the blogs seo from the Redis cache
    let data = await redisService.get(`blogs-seo`);

    // If the blogs seo are not found in the cache
    if (!data) {
      data = await service.findAndCountAll(sqquery(req.query));
      redisService.set(`blogs-seo`, data);
    }

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
    const cacheKey = `blog?seo=${req.params.blogId}`;
    let data = await redisService.get(cacheKey);

    if (!data) {
      data = await service.findOne({
        where: {
          blogId: req.params.blogId,
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
    // Update the blog data
    const [affectedRows] = await service.update(req.body, {
      where: {
        blogId: req.params.blogId,
      },
    });

    // Send the response
    res.status(200).json({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    // Handle errors here
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const affectedRows = await service.delete({
      where: {
        blogId: req.params.blogId,
      },
    });

    res.status(200).send({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    next(error);
  }
};
