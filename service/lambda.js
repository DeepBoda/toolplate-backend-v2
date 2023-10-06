"use strict";
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const lambdaClient = new LambdaClient({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Function to send a notification
exports.sendNotificationToTopic = async (notificationData) => {
  try {
    // Extract properties from the notificationData object
    const { topic, title, body, click_action } = notificationData;

    // Invoke the Lambda function
    const params = {
      FunctionName: "sendNotificationToTopic", // Replace with your Lambda function name
      Payload: JSON.stringify({
        title,
        body,
        topic,
        click_action,
      }),
    };
    try {
      const lambdaData = await lambdaClient.send(new InvokeCommand(params));
      console.log("Notification sent successfully by Lambda:\n", lambdaData);
      return true;
    } catch (error) {
      console.error("Error sending notification:\n", error);
      return false;
    }
  } catch (error) {
    console.error("Error sending notification:\n", error);
    throw error; // You can choose to handle or rethrow the error as needed.
  }
};
