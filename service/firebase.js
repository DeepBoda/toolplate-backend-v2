"use strict";

const admin = require("../config/firebaseConfig");
const notificationService = require("../modules/notification/service");

// Function to send a notification to a single device
exports.pushNotificationTo = async (to, title, body, click_action, userId) => {
  const message = {
    token: to,
    notification: {
      title,
      body,
    },
    data: {
      click_action,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent:", response);
    // Log to database or take other actions
    // await notificationService.create({ userId, title, body, click_action });
    return { status: "success", message: "Notification sent successfully" };
  } catch (error) {
    console.error("Error sending message:", error);
    return { status: "error", message: "Failed to send notification" };
  }
};

// Function to send notifications to multiple devices in a batch
exports.pushNotificationToBulk = async (to, title, body, click_action) => {
  const message = {
    tokens: to,
    notification: {
      title,
      body,
    },
    data: {
      click_action,
    },
  };

  try {
    const response = await admin.messaging().sendMulticast(message);

    console.log("Successfully sent:", response);
    // Log to database or take other actions
    // await notificationService.create({ userId, title, body, click_action });
    return { status: "success", message: "Notifications sent successfully" };
  } catch (error) {
    console.error("Error sending messages:", error);
    return { status: "error", message: "Failed to send notifications" };
  }
};

// Topic to send notifications to subscribers
exports.pushNotificationTopic = async (
  topic,
  title,
  body,
  click_action,
  adminId
) => {
  const message = {
    data: {
      title,
      body,
      click_action,
      badge: "1",
      sound: "https://cdn.toolplate.ai/asset/Notification.mp3",
    },
    topic,
  };

  try {
    const response = await admin.messaging().send(message);

    notificationService.create({
      AdminId: adminId,
      title,
      body,
      click_action,
      topic,
    });
    console.log(`Successfully sent notification - ${topic} :`, response);
    return {
      status: "success",
      message: `Notification sent to ${topic} successfully!`,
    };
  } catch (error) {
    console.error(`Error sending notification to ${topic} :`, error);
    return {
      status: "error",
      message: `Failed to send notification to ${topic}!`,
    };
  }
};
