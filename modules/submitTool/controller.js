"use strict";

const service = require("./service");
const { usersqquery, sqquery } = require("../../utils/query");
const { submitToolAttributes } = require("../../constants/queryAttributes");
const Category = require("../category/model");
const SubmitToolCategory = require("../submitToolCategory/model");
const submitToolCategoryService = require("../submitToolCategory/service");
const toolService = require("../tool/service");
const {
  replySubmittedTool,
  reviewSubmittedTool,
  featured,
  rejected,
} = require("../../utils/mail");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    if (req.files) {
      // Check if  (logo) uploaded and if got URL
      if (req.files.logo) {
        req.body.logo = req.files.logo[0].location;
      }
      if (req.files.previews) {
        req.body.previews = req.files.previews.map((el) => el.location);
      }
    }

    req.body.userId = req.requestor ? req.requestor.id : null;
    const { categories, ...bodyData } = req.body;

    const data = await service.create(bodyData);

    // Step 1: Add entries in the `toolCategory` table using bulk insert
    const categoryBulkInsertData = JSON.parse(categories).map((categoryId) => ({
      submitToolId: data.id,
      categoryId,
    }));

    const { firstName, lastName, email, title } = bodyData;

    // Combine firstName and lastName with a space in between
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const username = `${capitalize(firstName.trim())} ${capitalize(
      lastName.trim()
    )}`;

    // Send reply  email for submission
    replySubmittedTool({ email, username, title });

    //  execute bulk inserts concurrently
    submitToolCategoryService.bulkCreate(categoryBulkInsertData);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    // If the categories is not found in the cache
    const data = await service.findAndCountAll({
      ...sqquery(req.query, {}, ["title"]),
      // attributes: submitToolAttributes,
      include: {
        model: SubmitToolCategory,
        attributes: ["categoryId"],
        include: {
          model: Category,
          attributes: ["id", "name"],
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

exports.getById = async (req, res, next) => {
  try {
    const data = await service.findOne({
      where: {
        id: req.params.id,
      },
      include: {
        model: SubmitToolCategory,
        attributes: ["categoryId"],
        include: {
          model: Category,
          attributes: ["id", "name"],
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

// ---------- Only Admin can Update/Delete ----------
exports.update = async (req, res, next) => {
  try {
    // Update the blog data
    const { status, toolId, reason } = req.body;

    const { firstName, lastName, title, email } = await service.findOne({
      where: {
        id: req.params.id,
      },
    });

    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // Combine firstName and lastName with a space in between
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const username = `${capitalize(firstName.trim())} ${capitalize(
      lastName.trim()
    )}`;

    // Send email for submission
    if (status == "OnGoing") {
      reviewSubmittedTool({ email, username, title });
    } else if (status == "Approved" && toolId) {
      const { title, slug } = await toolService.findOne({
        where: {
          id: toolId,
        },
      });
      featured({ email, username, tool: title, slug, isCompany: false });
    } else if (status == "Denied" && reason) {
      rejected({ email, username, tool: title, reason, isCompany: false });
    }

    // Send the response
    res.status(200).json({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    // console.error(error);
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete record from the 'service' module and await the response
    const affectedRows = await service.delete({ where: { id } });

    // Send response with the number of affected rows
    res.status(200).send({
      status: "success",
      data: {
        affectedRows,
      },
    });
  } catch (error) {
    // Pass error to the next middleware
    next(error);
  }
};
