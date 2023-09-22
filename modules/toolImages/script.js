"use strict";
const { toolPreviewSize } = require("../../constants");
const { resizeAndUploadImage } = require("../../utils/imageResize");
const service = require("./service");
const toolService = require("../tool/service");
const imageResize = async () => {
  try {
    const toolImages = await service.findAll();

    for (let i in toolImages) {
      await resizeAndUploadImage(
        toolPreviewSize,
        toolImages[i].image,
        `toolPreview_${toolImages[i].id}`
      );
      console.log(toolImages[i].id);
    }
  } catch (error) {
    console.log(error);
  }
};

const toolPreviewToToolImage = async () => {
  try {
    const tool = await toolService.findAll();

    for (let i in tool) {
      console.log(tool[i].toJSON().previews);
      let data = tool[i].toJSON().previews.map((el) => {
        return {
          image: el,
          toolId: tool[i].id,
        };
      });
      console.log(data);
      await service.bulkCreate(data);
    }
  } catch (error) {
    console.log(error);
  }
};
imageResize();
