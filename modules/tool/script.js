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
    console.log(error);
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
    console.log(error);
  }
};
imageResize();
