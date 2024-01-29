"use strict";
const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const moment = require("moment");
const createError = require("http-errors");
const slugify = require("slugify");
const service = require("./service");
const { pushNotificationTopic } = require("../../service/firebase");
const redisService = require("../../utils/redis");
const seoService = require("../blogSeo/service");
const viewService = require("../blogView/service");
const { blogResizeImageSize } = require("../../constants");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  blogAttributes,
  blogCategoryAttributes,
  blogAllAdminAttributes,
} = require("../../constants/queryAttributes");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const BlogCategory = require("../blogCategory/model");
const blogCategoryService = require("../blogCategory/service");
const CategoryOfBlog = require("../categoryOfBlog/model");
const categoryOfBlogService = require("../categoryOfBlog/service");
const {
  resizeAndUploadImage,
  resizeAndUploadWebP,
} = require("../../utils/imageResize");
const createHttpError = require("http-errors");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    // Check if an image file is provided and add the file location to the request body
    if (req.file) {
      req.body.image = req.file.location;
    }

    // Create slug URL based on title
    req.body.slug = slugify(req.body.title, {
      replacement: "-", // Replace spaces with hyphens
      lower: true, // Convert to lowercase
      remove: /[*+~.()'"!:@/?\\[\],{}]/g, // Remove special characters
    });

    const { categories, ...bodyData } = req.body;

    // Create the new blog entry in the `blog` table
    const blog = await service.create(bodyData);

    // Send a push notification with the blog title and body
    if (blog.createdAt == blog.release) {
      const topic =
        process.env.NODE_ENV === "production"
          ? process.env.TOPIC
          : process.env.DEV_TOPIC;
      const title = blog.title;
      const body = "Hot on Toolplate- check it now!";
      const click_action = `blog/${blog.slug}`;
      pushNotificationTopic(topic, title, body, click_action, 1);
    }

    // Get the comma-separated `categories`  IDs
    const categoryIds = categories.split(",").map(Number);

    // Create an array of objects for bulk insert in `blogCategory` table
    const categoryBulkInsertData = categoryIds.map((categoryId) => ({
      blogId: blog.id,
      categoryOfBlogId: categoryId,
    }));
    const seoData = {
      blogId: blog.id,
      title: blog.title,
      description: blog.description,
    };
    // Use bulk create operations for `blogCategory`
    blogCategoryService.bulkCreate(categoryBulkInsertData);
    seoService.create(seoData);

    // Send the HTTP response with a success status and the created blog entry
    res.status(200).json({
      status: "success",
      data: blog,
    });

    // Resize and upload the blog image
    resizeAndUploadImage(blogResizeImageSize, blog.image, `blog_${blog.id}`);
    resizeAndUploadWebP(blogResizeImageSize, blog.image, `blog_${blog.id}`);
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
      where["$blogCategories.categoryOfBlogId$"] = {
        [Op.in]: categoryIdArray,
      };
    }

    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(
        query,
        {
          release: {
            [Op.lte]: moment(), // Less than or equal to the current date
          },
        },
        ["title"]
      ),
      distinct: true, // Add this option to ensure accurate counts
      attributes: [
        ...blogAttributes,
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
      include: {
        model: BlogCategory,
        attributes: ["categoryOfBlogId"],
        ...query,
        where,
        include: {
          model: CategoryOfBlog,
          attributes: blogCategoryAttributes,
        },
      },
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
    const { categoryIds, ...query } = req.query;

    const where = {};

    if (categoryIds) {
      // Split the comma-separated categoryIds into an array
      const categoryIdArray = categoryIds.split(",").map(Number);

      // Use the `Op.in` operator to find blogs that match any of the specified categoryIds
      where["$blogCategories.categoryOfBlogId$"] = {
        [Op.in]: categoryIdArray,
      };
    }
    const data = await service.findAndCountAll({
      ...sqquery(
        query,
        {
          release: {
            [Op.lte]: moment(), // Less than or equal to the current date
          },
        },
        ["title"]
      ),
      distinct: true, // Add this option to ensure accurate counts
      attributes: blogAllAdminAttributes,
      include: {
        model: BlogCategory,
        required: false,

        attributes: ["categoryOfBlogId"],
        ...query,
        where,
        include: {
          model: CategoryOfBlog,
          required: false,

          attributes: blogCategoryAttributes,
        },
      },
    });

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};
exports.getScheduledForAdmin = async (req, res, next) => {
  try {
    const { categoryIds, ...query } = req.query;

    const where = {};

    if (categoryIds) {
      // Split the comma-separated categoryIds into an array
      const categoryIdArray = categoryIds.split(",").map(Number);

      // Use the `Op.in` operator to find blogs that match any of the specified categoryIds
      where["$blogCategories.categoryOfBlogId$"] = {
        [Op.in]: categoryIdArray,
      };
    }
    const data = await service.findAndCountAll({
      ...sqquery(
        query,
        {
          release: {
            [Op.gt]: moment(), // Less than or equal to the current date
          },
        },
        ["title"]
      ),
      distinct: true, // Add this option to ensure accurate counts
      attributes: blogAllAdminAttributes,
      include: [
        {
          model: BlogCategory,
          attributes: ["categoryOfBlogId"],
          ...query,
          where,
          include: {
            model: CategoryOfBlog,
            attributes: blogCategoryAttributes,
          },
        },
      ],
    });

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
    const cacheKey = `blog?slug=${req.params.slug}`;
    let data = await redisService.get(cacheKey);

    if (!data) {
      data = await service.findOne({
        where: {
          slug: req.params.slug,
        },
        include: [
          {
            model: BlogCategory,
            attributes: ["categoryOfBlogId"],
            include: {
              model: CategoryOfBlog,
              attributes: blogCategoryAttributes,
            },
          },
        ],
      });

      redisService.set(cacheKey, data);
    }

    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};
exports.getByCategorySlug = async (req, res, next) => {
  try {
    const category = await categoryOfBlogService.findOne({
      where: {
        slug: req.params.slug,
      },
    });

    if (!category) {
      return next(createHttpError(404, "Category not found!"));
    }

    const where = {};

    where["$blogCategories.categoryOfBlogId$"] = category.id;

    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(
        req.query,
        {
          release: {
            [Op.lte]: moment(), // Less than or equal to the current date
          },
        },
        ["title"]
      ),
      distinct: true, // Add this option to ensure accurate counts
      attributes: [
        ...blogAttributes,
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
          attributes: ["categoryOfBlogId"],
          ...req.query,
          where,
          include: {
            model: CategoryOfBlog,
            attributes: blogCategoryAttributes,
          },
        },
      ],
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

exports.createView = async (req, res, next) => {
  try {
    // Use await with service.update
    service.update(
      { views: sequelize.literal("views + 1") },
      { where: { id: req.params.id } }
    );

    // Create the view record
    viewService.create({
      blogId: req.params.id,
      userId: req.requestor?.id || null,
    });

    // Send the response with a status code of 200 and a success message
    res.status(200).send({
      status: "success",
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
      include: {
        model: BlogCategory,
        attributes: ["categoryOfBlogId"],
        include: {
          model: CategoryOfBlog,
          attributes: ["id", "name"],
        },
      },
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
      include: {
        model: BlogCategory,
        attributes: ["categoryOfBlogId"],
      },
    });

    if (!openedBlog) {
      throw createError(404, "Blog not found");
    }

    // Find blogs that have the same category as the opened blog
    const categoryIds = openedBlog.blogCategories.map(
      (blogCategory) => blogCategory.categoryOfBlogId
    );

    const userId = req.requestor ? req.requestor.id : null;
    // Find blogs with the same category
    const relatedBlogs = await service.findAll({
      // ...sqquery(req.query),
      where: {
        id: { [Op.ne]: req.params.id },
        "$blogCategories.categoryOfBlogId$": { [Op.in]: categoryIds },
        release: {
          [Op.lte]: moment(), // Less than or equal to the current date
        },
      },
      attributes: [
        ...blogAttributes,
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
          attributes: ["categoryOfBlogId"],
          include: {
            model: CategoryOfBlog,
            attributes: blogCategoryAttributes,
          },
        },
      ],
    });

    // Calculate matching percentage for each blog
    relatedBlogs.forEach((blog) => {
      const commonCategories = blog.blogCategories.filter((blogCategory) =>
        categoryIds.includes(blogCategory.categoryOfBlogId)
      );

      const totalCategories = categoryIds.length;
      const matchingCategories = commonCategories.length;

      // Calculate matching percentage
      blog.dataValues.matchingPercentage =
        (matchingCategories / totalCategories) * 100;
    });

    // Sort blogs based on matching percentage in descending order
    relatedBlogs.sort(
      (a, b) =>
        b.dataValues.matchingPercentage - a.dataValues.matchingPercentage
    );

    // Limit the result to the top 3 most related blogs
    const mostRelatedBlogs = relatedBlogs.slice(0, 3);

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

exports.getSlugsForSitemap = async (req, res, next) => {
  try {
    const url =
      process.env.NODE_ENV === "production"
        ? process.env.PROD_WEB
        : process.env.DEV_WEB;

    // If the blogs are not found in the cache
    const blogs = await service.findAll();

    // Generate array of objects with slug and updatedAt
    const blogSlugs = blogs.map((blog) => ({
      slug: `${url}/blog/${blog.slug}`,
      updatedAt: blog.updatedAt, // Assuming updatedAt is a field in your blog model
    }));

    // Send the response
    res.status(200).json({
      status: "success",
      data: blogSlugs,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { file, body } = req;

    // Retrieve the old blog data based on the provided blog ID
    const oldBlogData = await service.findOne({ where: { id } });

    // Check if an image is uploaded and update the image property in the request body
    if (file) {
      body.image = file.location;

      // Resize and upload the image (if needed)
      resizeAndUploadImage(blogResizeImageSize, file.location, `blog_${id}`);
      resizeAndUploadWebP(blogResizeImageSize, file.location, `blog_${id}`);
    }

    if (body.slug) {
      const exist = await service.findOne({
        where: {
          slug: body.slug,
        },
      });
      if (exist && exist.id != id)
        return res.status(403).send({
          status: "error",
          message: "Oops! slug is already associated with existing blog.",
        });
    }

    const { categories, ...updatedData } = body;

    // Update the blog data
    const [affectedRows] = await service.update(updatedData, { where: { id } });

    // Send the response
    res.status(200).json({ status: "success", data: { affectedRows } });

    // Clear Redis cache
    redisService.del(`blog?slug=${oldBlogData.slug}`);

    // Handle categories  updates
    const categoryIds = categories.split(",").map(Number);

    // Delete existing associations with categories
    await blogCategoryService.delete({ where: { blogId: id } });

    // Create an array of objects for bulk insert in `blogCategory` table
    const categoryBulkInsertData = categoryIds.map((categoryId) => ({
      blogId: id,
      categoryOfBlogId: categoryId,
    }));

    // Use bulk create operations for `blogCategory`
    await blogCategoryService.bulkCreate(categoryBulkInsertData);

    // Handle the file deletion
    if (file && oldBlogData?.image) {
      deleteFilesFromS3([oldBlogData.image]);
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

    // Delete associated categories
    blogCategoryService.delete({
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
      let slug = slugify(allBlog[i].title, {
        replacement: "-", // Replace spaces with hyphens
        lower: true, // Convert to lowercase
        remove: /[*+~.()'"!:@/?\\[\],{}]/g, // Remove special characters
      });
      allBlog[i].slug = slug;
      allBlog[i].save();
    }
  } catch (error) {
    console.error(error);
  }
};
// makeSLug();
