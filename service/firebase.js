require("dotenv").config();
const admin = require("../config/firebaseConfig");
// const notificationService = require("../modules/notification/service");

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
  admin
    .messaging()
    .send(message)
    .then((response) => {
      // See the MessagingTopicManagementResponse reference documentation
      // for the contents of response.
      console.log("Successfully subscribed to:", response);
      // await notificationService.create({
      //   userId,
      //   title,
      //   body,
      //   click_action,
      // });
    })
    .catch(function (error) {
      console.error("Error sending message:\n", error);
    });

  return true;
};

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
  admin
    .messaging()
    .sendMulticast(message)
    .then(async function (response) {
      // See the MessagingTopicManagementResponse reference documentation
      // for the contents of response.
      console.log("Successfully subscribed to:", response);
      // await notificationService.create({
      //   userId,
      //   title,
      //   body,
      //   click_action,
      // });
    })
    .catch(function (error) {
      console.error(error);
    });

  return true;
};

exports.pushNotificationTopic = async (topic, title, body, click_action) => {
  const message = {
    notification: {
      title,
      body,
    },
    data: {
      click_action,
    },
    topic,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully subscribed to topic:->", response);
    return true;
  } catch (error) {
    console.error("Error subscribing to topic:\n", error);
    return false;
  }
};
