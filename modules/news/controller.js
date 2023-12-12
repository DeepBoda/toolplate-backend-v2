"use strict";
const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const moment = require("moment");
const createError = require("http-errors");
const slugify = require("slugify");
const service = require("./service");
const { pushNotificationTopic } = require("../../service/firebase");
const redisService = require("../../utils/redis");

// const viewService = require("../newsView/service");
const { newsResizeImageSize } = require("../../constants");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  newsAttributes,
  categoryAttributes,
  newsAllAdminAttributes,
  newsCategoryAttributes,
} = require("../../constants/queryAttributes");
const { deleteFilesFromS3 } = require("../../middlewares/multer");
const NewsCategory = require("../newsCategory/model");
const newsCategoryService = require("../newsCategory/service");
const Category = require("../category/model");
const categoryService = require("../category/service");
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

    // Create the new news entry in the `news` table
    const news = await service.create(req.body);

    // Send the HTTP response with a success status and the created news entry
    res.status(200).json({
      status: "success",
      data: news,
    });

    // Resize and upload the news image
    resizeAndUploadImage(newsResizeImageSize, news.image, `news_${news.id}`);
    resizeAndUploadWebP(newsResizeImageSize, news.image, `news_${news.id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(req.query, {}, ["title", "description"]),
      distinct: true, // Add this option to ensure accurate counts
      attributes: [
        ...newsAttributes,
        // [
        //   sequelize.literal(
        //     `(SELECT COUNT(*) FROM newsWishlists WHERE newsWishlists.newsId = news.id AND newsWishlists.UserId = ${userId}) > 0`
        //   ),
        //   "isWishlisted",
        // ],
      ],
      include: {
        model: NewsCategory,
        attributes: newsCategoryAttributes,
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

exports.getAllForAdmin = async (req, res, next) => {
  try {
    const data = await service.findAndCountAll({
      ...sqquery(req.query, {}, ["title"]),
      distinct: true, // Add this option to ensure accurate counts
      // attributes: newsAllAdminAttributes,
      include: {
        model: NewsCategory,
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

exports.getBySlug = async (req, res, next) => {
  try {
    const cacheKey = `news?slug=${req.params.slug}`;
    let data = await redisService.get(cacheKey);

    if (!data) {
      data = await service.findOne({
        where: {
          slug: req.params.slug,
        },
        include: [
          {
            model: NewsCategory,
            attributes: newsCategoryAttributes,
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
    const category = await newsCategoryService.findOne({
      where: {
        slug: req.params.slug,
      },
    });

    if (!category) {
      return next(createHttpError(404, "Category not found!"));
    }

    const userId = req.requestor ? req.requestor.id : null;

    const data = await service.findAndCountAll({
      ...sqquery(
        req.query,
        {
          newsCategoryId: category.id,
        },
        ["title"]
      ),
      distinct: true, // Add this option to ensure accurate counts
      attributes: [
        ...newsAttributes,
        // [
        //   sequelize.literal(
        //     `(SELECT COUNT(*) FROM newsWishlists WHERE newsWishlists.newsId = news.id AND newsWishlists.UserId = ${userId}) > 0`
        //   ),
        //   "isWishlisted",
        // ],
      ],
      include: [
        {
          model: NewsCategory,
          attributes: newsCategoryAttributes,
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

exports.createView = async (req, res, next) => {
  try {
    // Use await with service.update
    service.update(
      { views: sequelize.literal("views + 1") },
      { where: { id: req.params.id } }
    );

    // Create the view record
    viewService.create({
      newsId: req.params.id,
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
    const data = await service.findOne({
      where: {
        id: req.params.id,
      },
      include: {
        model: NewsCategory,
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

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { file, body } = req;

    // Retrieve the old news data based on the provided news ID
    const oldNewsData = await service.findOne({ where: { id } });

    // Check if an image is uploaded and update the image property in the request body
    if (file) {
      body.image = file.location;

      // Resize and upload the image (if needed)
      resizeAndUploadImage(newsResizeImageSize, file.location, `news_${id}`);
      resizeAndUploadWebP(newsResizeImageSize, file.location, `news_${id}`);
    }

    // Create slug URL based on title
    if (body.title) {
      body.slug = slugify(body.title, {
        replacement: "-", // Replace spaces with hyphens
        lower: true, // Convert to lowercase
        remove: /[*+~.()'"!:@/?\\[\],{}]/g, // Remove special characters
      });
    }

    // Update the news data
    const [affectedRows] = await service.update(body, { where: { id } });

    // Send the response
    res.status(200).json({ status: "success", data: { affectedRows } });

    // Clear Redis cache
    redisService.del(`news?slug=${oldNewsData.slug}`);

    // Handle the file deletion
    if (file && oldNewsData?.image) {
      deleteFilesFromS3([oldNewsData.image]);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    // Find the news to get the image URL
    const { image } = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

    // Delete the news entry
    const affectedRows = await service.delete({
      where: {
        id: req.params.id,
      },
    });

    // Delete the file from S3 if an image URL is present
    if (image) deleteFilesFromS3([image]);

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
    const allNews = await service.findAll({
      attributes: ["id", "title"],
    });

    for (let i in allNews) {
      let slug = slugify(allNews[i].title, {
        replacement: "-", // Replace spaces with hyphens
        lower: true, // Convert to lowercase
        remove: /[*+~.()'"!:@/?\\[\],{}]/g, // Remove special characters
      });
      allNews[i].slug = slug;
      allNews[i].save();
    }
  } catch (error) {
    console.error(error);
  }
};
// makeSLug();
