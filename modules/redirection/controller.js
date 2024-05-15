"use strict";

const service = require("./service");
const redisService = require("../../utils/redis");
const { usersqquery, sqquery } = require("../../utils/query");
const MainCategory = require("../mainCategory/model");
const { trimUrl } = require("../../utils/service");

const CACHE_EXPIRATION = 3600; // Cache expiration time in seconds (1 hour)

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    req.body.AdminId = req.requestor ? req.requestor.id : 1;
    const data = await service.create(req.body);

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
    // Try to retrieve the redirection from the Redis cache
    let data = await redisService.get(`redirection`);

    // If the redirection are not found in the cache
    if (!data) {
      data = await service.findAndCountAll(usersqquery(req.query));
      await redisService.set(`redirection`, data, CACHE_EXPIRATION);
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
    // If the redirection is not found in the cache
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

exports.getOneByUrl = async (req, res, next) => {
  try {
    let old = trimUrl(req.body.url);

    // Try to retrieve the redirection from the Redis cache
    let data = await redisService.get(`redirect-${old}`);
    if (!data) {
      data = await service.findOne({
        where: { old },
      });
      await redisService.set(`redirect-${old}`, data, CACHE_EXPIRATION);
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
    // Update the blog data
    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    await redisService.del(`redirection`);
    await redisService.hDel(`redirect-*`);

    // Send the response
    res.status(200).json({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete record from the 'service' module and await the response
    const affectedRows = await service.delete({ where: { id } });

    await redisService.del(`redirection`);

    // Send response with the number of affected rows
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
