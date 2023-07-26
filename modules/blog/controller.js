"use strict";

const service = require("./service");
const { cl } = require("../../utils/service");
const { usersqquery, sqquery } = require("../../utils/query");
const { deleteFilesFromS3 } = require("../../middlewares/multer");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    if (req.file) req.body.image = req.file.location;
    const data = await service.create(req.body);

    res.status(200).json({
      status: "success",
      data,
    });
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
    if (req.file) {
      req.body.image = req.file.location;
      oldBlogData = await service.findOne({
        where: {
          id: req.params.id,
        },
      });
    }
    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        affectedRows,
      },
      // token,
    });
    if (req.file && oldBlogData?.image) deleteFilesFromS3([oldBlogData?.image]);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    // If a image URL is present, delete the file from S3
    const { image } = await service.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (image) deleteFilesFromS3([image]);

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
