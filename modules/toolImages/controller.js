"use strict";
const service = require("./service");
const { usersqquery, sqquery } = require("../../utils/query");
const { toolPreviewSize } = require("../../constants");
const { resizeAndUploadImage } = require("../../utils/imageResize");
const { deleteFilesFromS3 } = require("../../middlewares/multer");

// ------------- Only Admin can Create, Get or Delete --------------
exports.add = async (req, res, next) => {
  let toolPreviews; // Declare toolPreviews here to make it accessible outside the block
  try {
    // Check if Previews uploaded and if got URLs
    if (req.files.previews) {
      const previews = req.files.previews.map((el) => ({
        image: el.location,
        toolId: req.body.toolId,
      }));

      // Bulk insert the records into the ToolImage table
      toolPreviews = await service.bulkCreate(previews);
      toolPreviews.map((e) => {
        resizeAndUploadImage(toolPreviewSize, e.image, `toolPreview_${e.id}`);
      });
    }

    res.status(200).json({
      status: "success",
      data: toolPreviews,
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
