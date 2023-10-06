"use strict";

const service = require("./service");
const { sendNotificationToTopic } = require("../../service/lambda");
const { usersqquery, sqquery } = require("../../utils/query");
const { pushNotificationTopic } = require("../../service/firebase");

// ------------- Only Admin can Create --------------
exports.add = async (req, res, next) => {
  try {
    req.body.topic =
      process.env.NODE_ENV === "production"
        ? process.env.TOPIC
        : process.env.DEV_TOPIC;

    // sendNotificationToTopic(req.body);
    pushNotificationTopic(req.body);
    service.create(req.body);

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
    const data = await service.findAndCountAll(sqquery(req.query));

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
