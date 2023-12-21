"use strict";

const router = require("express").Router();
const Notification = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(Notification.getAll)
  .post(joiValidator(joiSchema.create), Notification.add);
router
  .route("/:id")
  .get(Notification.getById)
  .patch(joiValidator(joiSchema.update), Notification.update)
  .delete(Notification.delete);

module.exports = router;
