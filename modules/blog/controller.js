"use strict";
const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const createError = require("http-errors");
const service = require("./service");
const redisService = require("../../utils/redis");
const viewService = require("../blogView/service");
const { blogResizeImageSize } = require("../../constants");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  blogAttributes,
  tagAttributes,
  categoryAttributes,
} = require("../../constants/queryAttributes");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const BlogCategory = require("../blogCategory/model");
const blogCategoryService = require("../blogCategory/service");
const Category = require("../category/model");
const BlogTag = require("../blogTag/model");
const blogTagService = require("../blogTag/service");
const Tag = require("../tag/model");
const { resizeAndUploadImage } = require("../../utils/imageResize");
// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    if (req.file) req.body.image = req.file.location;

    //create slug url based on title
    req.body.slug = req.body.title
      .trim()
      .toLowerCase()
      .replace(/[?!$]/g, "")
      .replace(/[\s/]+/g, "-"); // Replace spaces or / with hyphens

    const { categories, tags, ...body } = req.body;
    // Step 1: Create the new blog entry in the `blog` table
    const blog = await service.create(body);

    // Step 2: Get the comma-separated `categories` and `tags` IDs
    const categoryIds = categories
      .split(",")
      .map((categoryId) => parseInt(categoryId));
    const tagIds = tags.split(",").map((tagId) => parseInt(tagId));

    // Step 3: Add entries in the `blogCategory` table
    for (const categoryId of categoryIds) {
      await blogCategoryService.create({
        blogId: blog.id,
        categoryId,
      });
    }

    // Step 4: Add entries in the `blogTag` table
    for (const tagId of tagIds) {
      await blogTagService.create({
        blogId: blog.id,
        tagId,
      });
    }

    res.status(200).json({
      status: "success",
      data: blog,
    });
    resizeAndUploadImage(blogResizeImageSize, blog.image, `blog_${blog.id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    // let data = await redisService.get(`blogs`);
    // if (!data)
    const { categoryIds, ...query } = req.query;

    const where = {};

    if (categoryIds) {
      // Split the comma-separated categoryIds into an array
      const categoryIdArray = categoryIds.split(",").map(Number);

      // Use the `Op.in` operator to find blogs that match any of the specified categoryIds
      where["$blogCategories.categoryId$"] = {
        [Op.in]: categoryIdArray,
      };
    }
    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(query, {}, ["title"]),
      distinct: true, // Add this option to ensure accurate counts
      attributes: [
        ...blogAttributes,
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `blogViews` WHERE `blog`.`id` = `blogViews`.`blogId` )"
          ),
          "views",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `blogLikes` WHERE `blog`.`id` = `blogLikes`.`blogId` )"
          ),
          "likes",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM (
              SELECT 1 AS count FROM blogComments WHERE blogComments.blogId = blog.id
              UNION ALL
              SELECT 1 AS count FROM blogComments AS bc JOIN blogCommentReplies AS bcr ON bc.id = bcr.blogCommentId WHERE bc.blogId = blog.id
            ) AS commentAndReplyCounts)`
          ),
          "comments",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `blogWishlists` WHERE `blog`.`id` = `blogWishlists`.`blogId` )"
          ),
          "wishlists",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM blogLikes WHERE blogLikes.blogId = blog.id AND blogLikes.UserId = ${userId}) > 0`
          ),
          "isLiked",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM blogWishlists WHERE blogWishlists.blogId = blog.id AND blogWishlists.UserId = ${userId}) > 0`
          ),
          "isWishlisted",
        ],
      ],
      include: [
        {
          model: BlogCategory,
          attributes: ["categoryId"],
          ...query,
          where,
          include: {
            model: Category,
            attributes: categoryAttributes,
          },
        },
        {
          model: BlogTag,
          attributes: ["tagId"],
          include: {
            model: Tag,
            attributes: tagAttributes,
          },
        },
      ],
    });

    // redisService.set(`blogs`, data);

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllForAdmin = async (req, res, next) => {
  try {
    // let data = await redisService.get(`blogs`);
    // if (!data)
    const { categoryIds, ...query } = req.query;

    const where = {};

    if (categoryIds) {
      // Split the comma-separated categoryIds into an array
      const categoryIdArray = categoryIds.split(",").map(Number);

      // Use the `Op.in` operator to find blogs that match any of the specified categoryIds
      where["$blogCategories.categoryId$"] = {
        [Op.in]: categoryIdArray,
      };
    }
    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(query, {}, ["title"]),
      distinct: true, // Add this option to ensure accurate counts
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM `blogViews` WHERE `blog`.`id` = `blogViews`.`blogId` )"
            ),
            "views",
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM `blogLikes` WHERE `blog`.`id` = `blogLikes`.`blogId` )"
            ),
            "likes",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM (
              SELECT 1 AS count FROM blogComments WHERE blogComments.blogId = blog.id
              UNION ALL
              SELECT 1 AS count FROM blogComments AS bc JOIN blogCommentReplies AS bcr ON bc.id = bcr.blogCommentId WHERE bc.blogId = blog.id
            ) AS commentAndReplyCounts)`
            ),
            "comments",
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM `blogWishlists` WHERE `blog`.`id` = `blogWishlists`.`blogId` )"
            ),
            "wishlists",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM blogLikes WHERE blogLikes.blogId = blog.id AND blogLikes.UserId = ${userId}) > 0`
            ),
            "isLiked",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM blogWishlists WHERE blogWishlists.blogId = blog.id AND blogWishlists.UserId = ${userId}) > 0`
            ),
            "isWishlisted",
          ],
        ],
      },
      include: [
        {
          model: BlogCategory,
          attributes: ["categoryId"],
          ...query,
          where,
          include: {
            model: Category,
            attributes: categoryAttributes,
          },
        },
        {
          model: BlogTag,
          attributes: ["tagId"],
          include: {
            model: Tag,
            attributes: tagAttributes,
          },
        },
      ],
    });

    // redisService.set(`blogs`, data);

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    let data = await redisService.get(`blog?slug=${req.params.slug}`);
    if (!data) {
      data = await service.findOne({
        where: {
          slug: req.params.slug,
        },
        include: [
          {
            model: BlogCategory,
            attributes: ["categoryId"],
            include: {
              model: Category,
              attributes: categoryAttributes,
            },
          },
          {
            model: BlogTag,
            attributes: ["tagId"],
            include: {
              model: Tag,
              attributes: tagAttributes,
            },
          },
        ],
      });
      redisService.set(`blog?slug=${req.params.slug}`, data);
    }
    viewService.create({
      blogId: data.id,
      userId: req.requestor?.id ?? null,
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDynamicBySlug = async (req, res, next) => {
  try {
    // let data = await redisService.get(`oneBlog`);
    // if (!data)
    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findOne({
      where: {
        slug: req.params.slug,
      },
      attributes: [
        ...blogAttributes,
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `blogViews` WHERE `blog`.`id` = `blogViews`.`blogId` )"
          ),
          "views",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `blogLikes` WHERE `blog`.`id` = `blogLikes`.`blogId` )"
          ),
          "likes",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM (
              SELECT 1 AS count FROM blogComments WHERE blogComments.blogId = blog.id
              UNION ALL
              SELECT 1 AS count FROM blogComments AS bc JOIN blogCommentReplies AS bcr ON bc.id = bcr.blogCommentId WHERE bc.blogId = blog.id
            ) AS commentAndReplyCounts)`
          ),
          "comments",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `blogWishlists` WHERE `blog`.`id` = `blogWishlists`.`blogId` )"
          ),
          "wishlists",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM blogLikes WHERE blogLikes.blogId = blog.id AND blogLikes.UserId = ${userId}) > 0`
          ),
          "isLiked",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM blogWishlists WHERE blogWishlists.blogId = blog.id AND blogWishlists.UserId = ${userId}) > 0`
          ),
          "isWishlisted",
        ],
      ],
    });

    // redisService.set(`oneBlog`, data);

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getForAdmin = async (req, res, next) => {
  try {
    // let data = await redisService.get(`oneBlog`);
    // if (!data)

    const data = await service.findOne({
      where: {
        id: req.params.id,
      },
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM `blogViews` WHERE `blog`.`id` = `blogViews`.`blogId` )"
            ),
            "views",
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM `blogLikes` WHERE `blog`.`id` = `blogLikes`.`blogId` )"
            ),
            "likes",
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM `blogWishlists` WHERE `blog`.`id` = `blogWishlists`.`blogId` )"
            ),
            "wishlists",
          ],
        ],
      },
      include: [
        {
          model: BlogCategory,
          attributes: ["categoryId"],
          include: {
            model: Category,
            attributes: ["id", "name"],
          },
        },
        {
          model: BlogTag,
          attributes: ["tagId"],
          include: {
            model: Tag,
            attributes: ["id", "name"],
          },
        },
      ],
    });

    // redisService.set(`oneBlog`, data);

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRelatedBlogs = async (req, res, next) => {
  try {
    // Find the details of the opened blog
    const openedBlog = await service.findOne({
      where: { id: req.params.id },
      attributes: blogAttributes,
      include: [
        {
          model: BlogCategory,
          attributes: ["categoryId"],
        },
        {
          model: BlogTag,
          attributes: ["tagId"],
        },
      ],
    });

    if (!openedBlog) {
      throw createError(404, "Blog not found");
    }

    // Find blogs that have the same category as the opened blog
    const categoryIds = openedBlog.blogCategories.map(
      (blogCategory) => blogCategory.categoryId
    );

    // Find blogs that have the same tags as the opened blog
    const tagIds = openedBlog.blogTags.map((blogTag) => blogTag.tagId);

    const userId = req.requestor ? req.requestor.id : null;
    // Find blogs with the same category or tag IDs
    const relatedBlogs = await service.findAll({
      // ...sqquery(req.query),
      where: {
        id: { [Op.ne]: req.params.id },
        [Op.or]: [
          { "$blogCategories.categoryId$": { [Op.in]: categoryIds } },
          { "$blogTags.tagId$": { [Op.in]: tagIds } },
        ],
      },
      attributes: [
        ...blogAttributes,
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM `blogViews` WHERE `blog`.`id` = `blogViews`.`blogId` )"
          ),
          "views",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM blogLikes WHERE blogLikes.blogId = blog.id AND blogLikes.UserId = ${userId}) > 0`
          ),
          "isLiked",
        ],
      ],

      include: [
        {
          model: BlogCategory,
          attributes: ["categoryId"],
          include: {
            model: Category,
            attributes: categoryAttributes,
          },
        },
        {
          model: BlogTag,
          attributes: ["tagId"],
          include: {
            model: Tag,
            attributes: tagAttributes,
          },
        },
      ],
    });

    // Calculate matching percentage for each blog
    relatedBlogs.forEach((blog) => {
      const commonCategories = blog.blogCategories.filter((blogCategory) =>
        categoryIds.includes(blogCategory.categoryId)
      );
      const commonTags = blog.blogTags.filter((blogTag) =>
        tagIds.includes(blogTag.tagId)
      );
      const totalCategories = categoryIds.length;
      const totalTags = tagIds.length;
      const matchingCategories = commonCategories.length;
      const matchingTags = commonTags.length;

      // Calculate matching percentage
      blog.dataValues.matchingPercentage =
        ((matchingCategories + matchingTags) / (totalCategories + totalTags)) *
        100;
    });

    // Sort blogs based on matching percentage in descending order
    relatedBlogs.sort(
      (a, b) =>
        b.dataValues.matchingPercentage - a.dataValues.matchingPercentage
    );

    // Limit the result to the top 3 most related blogs
    const mostRelatedBlogs = relatedBlogs.slice(0, 3);
    // console.log(mostRelatedBlogs);
    console.log("mostRelatedBlogs", mostRelatedBlogs);
    // Select only the required attributes (image and title) for each blog
    const reducedData = mostRelatedBlogs.map(
      (blog) => (
        (blog = blog.toJSON()),
        {
          ...blog,
        }
      )
    );

    res.status(200).json({
      status: "success",
      data: reducedData,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
    // Check if any files were uploaded and get oldBlogData if needed
    const oldBlogData = await service.findOne({ where: { id: req.params.id } });

    // Check if Image uploaded and if got URL
    if (req.file) {
      req.body.image = req.file.location;

      // Resize and upload the image (if needed)
      resizeAndUploadImage(
        blogResizeImageSize,
        req.file.location,
        `blog_${oldBlogData.id}`
      );
    }

    // Create slug URL based on title
    if (req.body.title) {
      req.body.slug = req.body.title
        .trim()
        .toLowerCase()
        .replace(/[?!$]/g, "")
        .replace(/[\s/]+/g, "-");
    }

    const { categories, tags, ...body } = req.body;

    // Update the blog data
    const [affectedRows] = await service.update(body, {
      where: { id: req.params.id },
    });

    // Send the response
    res.status(200).json({ status: "success", data: { affectedRows } });

    //clear redis cache
    if (req.body.title) await redisService.del(`blog?slug=${oldBlogData.slug}`);

    // Handle categories and tags updates
    const categoryIds = categories.split(",").map(Number);
    const tagIds = tags.split(",").map(Number);

    // Delete existing associations with categories and tags
    await Promise.all([
      blogCategoryService.delete({ where: { blogId: req.params.id } }),
      blogTagService.delete({ where: { blogId: req.params.id } }),
    ]);

    // Add updated entries in the `blogCategory` and `blogTag` tables
    await Promise.all([
      ...categoryIds.map((categoryId) =>
        blogCategoryService.create({ blogId: req.params.id, categoryId })
      ),
      ...tagIds.map((tagId) =>
        blogTagService.create({ blogId: req.params.id, tagId })
      ),
    ]);

    // Handle the file deletion
    if (req.file && oldBlogData?.image) {
      deleteFilesFromS3([oldBlogData?.image]);
    }
  } catch (error) {
    console.error(error);
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

    // Delete associated categories and tags
    await blogCategoryService.delete({
      where: {
        blogId: req.params.id,
      },
    });

    await blogTagService.delete({
      where: {
        blogId: req.params.id,
      },
    });

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

const makeSLug = async (req, res, next) => {
  try {
    const allBlog = await service.findAll({
      attributes: ["id", "title"],
    });

    for (let i in allBlog) {
      let slug = allBlog[i].title
        .trim()
        .toLowerCase()
        .replaceAll(/[?!.$]/g, "")
        .replaceAll(" ", "-");
      allBlog[i].slug = slug;
      allBlog[i].save();
    }
  } catch (error) {
    console.log(error);
  }
};
// makeSLug();
