"use strict";

const router = require("express").Router();
const Notification = require("./controller");
const NotificationSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(Notification.getAll)
  .post(joiValidator(NotificationSchema.create), Notification.add);
router
  .route("/:id")
  .get(Notification.getById)
  .patch(joiValidator(NotificationSchema.update), Notification.update)
  .delete(Notification.delete);

module.exports = router;
