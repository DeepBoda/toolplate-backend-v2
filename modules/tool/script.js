"use strict";
const { toolSize } = require("../../constants");
const { resizeAndUploadImage } = require("../../utils/imageResize");
const service = require("./service");
const { deleteFilesFromS3 } = require("../../middlewares/multer");

const imageResize = async () => {
  try {
    const tool = await service.findAll();

    for (let i in tool) {
      await resizeAndUploadImage(toolSize, tool[i].image, `tool_${tool[i].id}`);
      console.log(tool[i].id);
    }
  } catch (error) {
    console.error(error);
  }
};
const resizeImageDelete = async () => {
  try {
    const tool = await service.findAll();
    const deleteSize = [{ width: 120, height: 120 }];
    const deleteFiles = tool.flatMap((tool) =>
      deleteSize.map(
        (size) =>
          `${process.env.BUCKET_URL}/blog_${tool.id}_${size.width}_${size.height}.avif`
      )
    );
    console.log(deleteFiles);

    await deleteFilesFromS3(deleteFiles);
  } catch (error) {
    console.error(error);
  }
};
// imageResize();

const { tools, sequelize } = require("./model"); // Adjust the path

const updateToolCounts = async () => {
  try {
    const updateQuery = `
      UPDATE tools AS t
      SET
        t.views = IFNULL((SELECT COUNT(*) FROM toolViews AS tv WHERE tv.toolId = t.id), 0),
        t.likes = IFNULL((SELECT COUNT(*) FROM toolLikes AS tl WHERE tl.toolId = t.id), 0),
        t.wishlists = IFNULL((SELECT COUNT(*) FROM toolWishlists AS tw WHERE tw.toolId = t.id), 0),
        t.ratingsAverage = (
          SELECT IFNULL(
            ROUND(AVG(tr.rating), 1), 
            0
          )
          FROM toolRatings AS tr 
          WHERE tr.toolId = t.id
          AND tr.deletedAt IS NULL
        ),
        t.totalRatings = IFNULL(
          (SELECT COUNT(*) FROM toolRatings AS tr WHERE tr.toolId = t.id AND tr.deletedAt IS NULL),
          0
        );
    `;

    await sequelize.query(updateQuery, { type: sequelize.QueryTypes.UPDATE });

    console.log("Tools counts updated successfully");
  } catch (error) {
    console.error("Error updating tools counts:", error);
  }
};
updateToolCounts();
