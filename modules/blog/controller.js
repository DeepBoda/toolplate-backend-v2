"use strict";
const { Op, where } = require("sequelize");
const service = require("./service");
const viewService = require("../blogView/service");
const sequelize = require("../../config/db");
// const redisService = require("../../utils/redis");
const { cl } = require("../../utils/service");
const { usersqquery, sqquery } = require("../../utils/query");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const BlogCategory = require("../blogCategory/model");
const blogCategoryService = require("../blogCategory/service");
const Category = require("../category/model");
const BlogTag = require("../blogTag/model");
const blogTagService = require("../blogTag/service");
const Tag = require("../tag/model");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    const { categories, tags, ...body } = req.body;
    if (req.file) req.body.image = req.file.location;

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
  } catch (err) {
    cl(err);
    next(err);
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

    const data = await service.findAll({
      ...sqquery(query, {}, ["title"]),
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
          attributes: ["id", "blogId", "categoryId"],
          ...query,
          where,
          include: {
            model: Category,
            attributes: ["id", "name"],
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

exports.getById = async (req, res, next) => {
  try {
    // let data = await redisService.get(`oneBlog`);
    // if (!data)
    const userId = req.requestor ? req.requestor.id : null;

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
          attributes: ["id", "blogId", "categoryId"],
          include: {
            model: Category,
            attributes: ["id", "name"],
          },
        },
        {
          model: BlogTag,
          attributes: ["id", "blogId", "tagId"],
          include: {
            model: Tag,
            attributes: ["id", "name"],
          },
        },
      ],
    });
    await viewService.create({
      blogId: req.params.id,
      userId: req.requestor?.id ?? null,
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
      include: [
        {
          model: BlogCategory,
          include: {
            model: Category,
          },
        },
        {
          model: BlogTag,
          include: {
            model: Tag,
          },
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
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM `blogViews` WHERE `blog`.`id` = `blogViews`.`blogId` )"
            ),
            "views",
          ],
        ],
      },
      include: [
        {
          model: BlogCategory,
          attributes: ["id", "blogId", "categoryId"],
          include: {
            model: Category,
          },
        },
        {
          model: BlogTag,
          attributes: ["id", "blogId", "tagId"],
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

    // Select only the required attributes (image and title) for each blog
    const reducedData = mostRelatedBlogs.map(
      (blog) => (
        (blog = blog.toJSON()),
        {
          id: blog.id,
          title: blog.title,
          description: blog.description,
          image: blog.image,
          category: blog.blogCategories.map(
            (category) => category.category.name
          ),
          views: blog.views,
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
    let oldBlogData;
    if (req.file) {
      req.body.image = req.file.location;
      oldBlogData = await service.findOne({
        where: {
          id: req.params.id,
        },
      });
    }

    // Update the blog data
    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // Send the response
    res.status(200).json({
      status: "success",
      data: {
        affectedRows,
      },
    });

    // Handle the file deletion
    if (req.file && oldBlogData?.image) deleteFilesFromS3([oldBlogData?.image]);
  } catch (err) {
    // Handle errors here
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    // If a image URL is present, delete the file from S3
    const { image } = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

    const affectedRows = await service.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).send({
      status: "success",
      data: {
        affectedRows,
      },
    });
    // Handle the file deletion
    if (image) deleteFilesFromS3([image]);
  } catch (error) {
    next(error);
  }
};
