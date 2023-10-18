"use strict";

const service = require("./service");
const { sendNotificationToTopic } = require("../../service/lambda");
const { AdminAttributes } = require("../../constants/queryAttributes");
const { usersqquery, sqquery } = require("../../utils/query");
const { pushNotificationTopic } = require("../../service/firebase");
const Admin = require("../admin/model");

// ------------- Only Admin can Create and Get all--------------
exports.add = async (req, res, next) => {
  try {
    // Set the topic property of the request body based on the environment
    const adminId = req.requestor ? req.requestor.id : 1;
    const topic =
      process.env.NODE_ENV === "production"
        ? process.env.TOPIC
        : process.env.DEV_TOPIC;

    const { title, body, click_action } = req.body;

    // Send the notification to the specified topic
    // sendNotificationToTopic(topic, title, body, click_action);
    pushNotificationTopic(topic, title, body, click_action, adminId);

    // Save the notification data
    // service.create(req.body);

    // Send a success response
    res.status(200).json({
      status: "success",
      message: "Notification sent successfully!",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await service.findAndCountAll({
      ...sqquery(req.query, {}, ["title", "body"]),
      include: {
        model: Admin,
        attributes: AdminAttributes,
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
  } catch (error) {
    // console.error(error);
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};
