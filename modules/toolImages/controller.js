"use strict";
const service = require("./service");
const { usersqquery, sqquery } = require("../../utils/query");
const { deleteFilesFromS3 } = require("../../middlewares/multer");

// ------------- Only Admin can Create, Get or Delete --------------
exports.add = async (req, res, next) => {
  try {
    if (req.file) req.body.image = req.file.location;

    const blog = await service.create(req.body);

    res.status(200).json({
      status: "success",
      data: blog,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await service.findAndCountAll({
      ...sqquery(req.query),
      distinct: true,
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    // Find the blog to get the image URL
    const { image } = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

    // Delete the blog entry
    const affectedRows = await service.delete({
      where: {
        id: req.params.id,
      },
    });

    // Delete the file from S3 if an image URL is present
    if (image) deleteFilesFromS3([image]);

    // Send the response
    res.status(200).send({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
