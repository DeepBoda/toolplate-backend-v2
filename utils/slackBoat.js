const axios = require("axios");
exports.responseInClientSlack = async (body) => {
  try {
    return await axios.post(
      `https://hooks.slack.com/services/REPLACE/WITH/ACTUAL_WEBHOOK`,
      body
    );
  } catch (error) {
    console.log(error);
  }
};
