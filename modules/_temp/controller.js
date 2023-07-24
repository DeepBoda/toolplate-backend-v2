"use strict";
const createError = require("http-errors");
const service = require("./service");
const { sqquery } = require("../../utils/query");

exports.add = async (req, res, next) => {
  try {
    const temp = await service.create(req.body);

    res.status(200).json({
      status: "success",
      data: {
        temp,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await service.findAndCountAll(sqquery(req.query));

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

exports.update = async (req, res, next) => {
  try {
    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.params.id,
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

exports.delete = async (req, res, next) => {
  try {
    const affectedRows = await service.delete({
      where: {
        id: req.params.id,
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
