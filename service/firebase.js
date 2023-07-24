require("dotenv").config();
const admin = require("../config/firebaseConfige");
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
      console.log("Error sending message:", error);
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
      console.log(error);
    });

  return true;
};

exports.pushNotificationTopic = async (topic, title, body, click_action) => {
  const data = await new Promise((resolve, reject) => {
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
    admin
      .messaging()
      .send(message)
      .then(function (response) {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log("Successfully subscribed to topic:", response);
        resolve("success");
      })
      .catch(function (error) {
        console.log("Error subscribing to topic:", error);
        resolve("success");
      });
  });
  return true;
};
