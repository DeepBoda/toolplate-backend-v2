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

    deleteFilesFromS3(deleteFiles);
  } catch (error) {
    console.log(error);
  }
};

// imageResize();

const { blogs, sequelize } = require("./model"); // Adjust the path

const updateBlogCounts = async () => {
  try {
    const updateQuery = `
      UPDATE blogs AS b
      SET
        b.views = IFNULL((SELECT COUNT(*) FROM blogViews AS bv WHERE bv.blogId = b.id), 0),
        b.likes = IFNULL((SELECT COUNT(*) FROM blogLikes AS bl WHERE bl.blogId = b.id), 0),
        b.comments = IFNULL((
          SELECT COUNT(*) FROM (
            SELECT 1 FROM blogComments AS bc WHERE bc.blogId = b.id
            UNION ALL
            SELECT 1 FROM blogComments AS bc
            JOIN blogCommentReplies AS bcr ON bc.id = bcr.blogCommentId
            WHERE bc.blogId = b.id
          ) AS commentAndReplyCounts
        ), 0),
        b.wishlists = IFNULL((SELECT COUNT(*) FROM blogWishlists AS bw WHERE bw.blogId = b.id), 0);
    `;

    await sequelize.query(updateQuery, { type: sequelize.QueryTypes.UPDATE });

    console.log("Blogs counts updated successfully");
  } catch (error) {
    console.error("Error updating blogs counts:", error);
  }
};

// updateBlogCounts();
