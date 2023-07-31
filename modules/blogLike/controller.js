"use strict";

const service = require("./service");
const { cl } = require("../../utils/service");
const { usersqquery, sqquery } = require("../../utils/query");
const { deleteFilesFromS3 } = require("../../middlewares/multer");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    req.body.userId = req.requestor.id;
    const isAlreadyExist = await service.count({
      where: req.body,
    });
    if (isAlreadyExist) {
      await service.delete({
        where: req.body,
      });
      res.status(200).json({
        status: "success",
        message: "You removed like!.",
      });
    } else {
      await service.create(req.body);
      res.status(200).json({
        status: "success",
        message: "Liked blog 🫣!.",
      });
    }
  } catch (err) {
    cl(err);
    next(err);
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

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
    // Update the blog data
    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // Send the response
    res.status(200).json({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (err) {
    // Handle errors here
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const affectedRows = await service.delete({
      where: {
        userId: req.requestor.id,
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
