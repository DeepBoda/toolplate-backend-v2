"use strict";
const service = require("./service");

exports.getOne = async (req, res, next) => {
  try {
    const data = await service.findOne({
      where: {
        id: 1,
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

//for admin
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
    const temps = await service.findAndCountAll({});

    res.status(200).send({
      status: "success",
      data: temps,
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
      message: "delete app config successfully",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    next(error);
  }
};
