"use strict";
const { Op } = require("sequelize");
const moment = require("moment");
const service = require("./service");
const {
  AdminAttributes,
  notificationAdminAttributes,
} = require("../../constants/queryAttributes");
const { usersqquery, sqquery } = require("../../utils/query");
const { pushNotificationTopic } = require("../../service/firebase");
const Admin = require("../admin/model");

exports.clicks = async (req, res, next) => {
  try {
    const { title, body } = req.body;

    // Find the notification by title and body
    const notification = await service.findOne({
      where: {
        title,
        body,
      },
    });

    if (notification) {
      // Increment the 'clicks' count by 1
      notification.clicks = notification.clicks + 1;
      // Save the updated notification
      await notification.save();

      return res.status(200).json({
        status: "success",
        message: "Click count incremented successfully.",
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Notification not found.",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// ------------- Only Admin can Create and Get all--------------
exports.add = async (req, res, next) => {
  try {
    // Set the topic property of the request body based on the environment
    req.body.AdminId = req.requestor ? req.requestor.id : 1;
    req.body.topic =
      process.env.NODE_ENV === "production"
        ? process.env.TOPIC
        : process.env.DEV_TOPIC;

    // Save the notification data
    const { schedule, createdAt } = await service.create(req.body);

    let { topic, title, body, click_action, AdminId } = req.body;

    // Send the notification to the specified topic
    // sendNotificationToTopic(topic, title, body, click_action);
    if (moment(createdAt).isSame(schedule, "second")) {
      pushNotificationTopic(topic, title, body, click_action);
    }

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
      ...sqquery(
        req.query,
        {
          schedule: {
            [Op.lte]: moment(), // Less than or equal to the current date
          },
        },
        ["title", "body"]
      ),
      attributes: notificationAdminAttributes,
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
exports.getScheduledForAdmin = async (req, res, next) => {
  try {
    const data = await service.findAndCountAll({
      ...sqquery(
        req.query,
        {
          schedule: {
            [Op.gt]: moment(), // Less than or equal to the current date
          },
        },
        ["title", "body"]
      ),
      attributes: notificationAdminAttributes,
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

exports.scheduledNotifications = async () => {
  try {
    // Corrected to use moment() for startOfMinute since it was previously undefined.
    let startOfMinute = moment().startOf("minute");
    let endOfMinute = moment(startOfMinute).add(1, "minutes");

    let data = await service.findAll({
      where: {
        schedule: {
          [Op.gte]: startOfMinute, // Greater than or equal to the start of the current minute
          [Op.lt]: endOfMinute, // Less than the end of the current minute (start of next minute)
        },
      },
      attributes: ["id", "title", "body", "topic", "click_action"], // Ensure attributes match those needed for pushNotificationTopic
    });
    console.log("data ", data);
    // Check if there is data to process
    if (data.length > 0) {
      await Promise.all(
        data.map((item) => {
          item = item?.toJSON();
          console.log("item ", item);
          // Assuming pushNotificationTopic function is correctly implemented to handle notification logic
          return pushNotificationTopic(
            item.topic,
            item.title,
            item.body,
            item.click_action
          );
        })
      );
      console.log(`Sent ${data.length} notifications.`);
    } else {
      console.log("No notifications to send at this time.");
    }
  } catch (error) {
    console.error("Error in scheduledNotifications:", error);
  }
};
