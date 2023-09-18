"use strict";
const { blogResizeImageSize } = require("../../constants");
const { resizeAndUploadImage } = require("../../utils/imageResize");
const service = require("./service");
const { deleteFilesFromS3 } = require("../../middlewares/multer");

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
const resizeImageDelete = async () => {
  try {
    const blog = await service.findAll();
    const deleteSize = [
      { width: 360, height: 250 },
      { width: 900, height: 500 },
    ];
    const deleteFiles = blog.flatMap((blog) =>
      deleteSize.map(
        (size) =>
          `${process.env.BUCKET_URL}/blog_${blog.id}_${size.width}_${size.height}.avif`
      )
    );
    console.log(deleteFiles);

    await deleteFilesFromS3(deleteFiles);
  } catch (error) {
    console.log(error);
  }
};
imageResize();
