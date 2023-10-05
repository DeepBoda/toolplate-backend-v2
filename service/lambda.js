"use strict";
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "",
  secretAccessKey: "",
  region: "",
});
const lambda = new AWS.Lambda();

// Call the Lambda function
const params = {
  FunctionName: "sendNotificationToTopic",
  Payload: JSON.stringify({
    title: "Test Notification Title",
    body: "This is a test notification body",
    topic: "toolplate-blogs-dev",
    click_action: "blog",
  }),
};

lambda.invoke(params, (err, data) => {
  if (err) {
    console.error("Error calling Lambda function:", err);
  } else {
    console.log("Notification send successfully");
  }
});
