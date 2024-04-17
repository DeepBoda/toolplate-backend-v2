"use strict";

const service = require("./service");
const redisService = require("../../utils/redis");
const toolService = require("../tool/service");
const { usersqquery, sqquery } = require("../../utils/query");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    let [data, created] = await service.findOrCreate({
      where: { toolId: req.params.toolId },
      defaults: req.body,
    });

    if (!created) {
      await service.update(req.body, {
        where: {
          toolId: req.params.toolId,
        },
      });
      data = await service.findOne({
        where: { toolId: req.params.toolId },
      });
    }

    await Promise.all([
      redisService.del(`tools-alternative`),
      redisService.del(`tool?alternative=${req.params.toolId}`),
    ]);

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
    // Try to retrieve the tools alternative from the Redis cache
    let data = await redisService.get(`tools-alternative`);

    // If the tools alternative are not found in the cache
    if (!data) {
      data = await service.findAndCountAll(sqquery(req.query));
      redisService.set(`tools-alternative`, data);
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
    const { id } = await toolService.findOne({
      where: {
        slug: req.params.slug,
      },
    });
    const cacheKey = `tool?alternative=${id}`;

    let data = await redisService.get(cacheKey);

    if (!data) {
      data = await service.findOne({
        where: {
          toolId: id,
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
exports.getById = async (req, res, next) => {
  try {
    const cacheKey = `tool?alternative=${req.params.toolId}`;
    let data = await redisService.get(cacheKey);

    if (!data) {
      data = await service.findOne({
        where: {
          toolId: req.params.toolId,
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
    // Update the tool data
    const [affectedRows] = await service.update(req.body, {
      where: {
        toolId: req.params.toolId,
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
        toolId: req.params.toolId,
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
