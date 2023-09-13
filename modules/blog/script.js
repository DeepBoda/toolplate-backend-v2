"use strict";
const { blogResizeImageSize } = require("../../constants");
const { resizeAndUploadImage } = require("../../utils/imageResize");
const service = require("./service");
const imageResize = async () => {
  try {
    const blog = await service.findAll();

    for (let i in blog) {
      await resizeAndUploadImage(
        blogResizeImageSize,
        blog[i].image,
        `blog_${blog[i].id}`
      );
      console.log(blog[i].id);
    }
  } catch (error) {
    console.log(error);
  }
};
imageResize();
