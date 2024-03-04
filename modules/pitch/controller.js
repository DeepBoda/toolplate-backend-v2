"use strict";

const service = require("./service");
const { usersqquery, sqquery } = require("../../utils/query");
const {
  initialPitch,
  firstFollowUp,
  secondFollowUp,
  thirdFollowUp,
  featured,
  rejected,
} = require("../../utils/mail");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    req.body.userId = req.requestor ? req.requestor.id : null;
    const { company, toolName, email } = req.body;

    const data = await service.create(req.body);

    // Combine firstName and lastName with a space in between
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const username = capitalize(company.trim());

    // Send reply  email for pitch
    initialPitch({ email, username, tool: toolName });

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
    const { status } = req.body;

    const [affectedRows] = await service.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const org = await service.findOne({
      where: {
        id: req.params.id,
      },
    });
    const { company, email, tool } = org;

    // Combine firstName and lastName with a space in between
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const username = capitalize(company.trim());

    // Send email for pitch
    if (status == "FollowUp1") {
      firstFollowUp({ email, username, tool });
    } else if (status == "FollowUp2") {
      secondFollowUp({ email, username, tool });
    } else if (status == "FollowUp3") {
      thirdFollowUp({ email, username, tool });
    } else if (status == "Featured") {
      featured({ email, username, tool });
    } else if (status == "Rejected") {
      rejected({ email, username, tool });
    }

    // firstFollowUp({ email, username, tool });
    // secondFollowUp({ email, username, tool });
    // thirdFollowUp({ email, username, tool });
    // featured({ email, username, tool });
    // rejected({ email, username, tool });

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
