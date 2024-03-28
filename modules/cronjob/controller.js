const { scheduledNotifications } = require("../notification/controller");

exports.notification = async (req, res, next) => {
  try {
    await scheduledNotifications();
    res.status(200).json({ status: "Success" });
  } catch (error) {
    next(error);
  }
};
