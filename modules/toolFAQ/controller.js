"use strict";

const service = require("./service");
const Sequelize = require("sequelize");
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
        toolId: req.params.toolId,
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
