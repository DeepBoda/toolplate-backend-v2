const axios = require("axios");
exports.responseInClientSlack = async (body) => {
  try {
    return await axios.post(
      //   `https://hooks.slack.com/services/T02G8MF7NT0/B052L30C4RW/bLXx9huFSGkJdhr6KqCE`,--->use slack webhook id
      body
    );
  } catch (error) {
    console.log(error);
  }
};
