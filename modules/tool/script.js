"use strict";
const { toolSize } = require("../../constants");
const { resizeAndUploadImage } = require("../../utils/imageResize");
const service = require("./service");
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
imageResize();
