"use strict";

const router = require("express").Router();
const appConfig = require("./controller");
const { joiValidator } = require("../../middlewares/joiValidator");
const joiSchema = require("./joiSchema");

router
  .route("/")
  .get(appConfig.getAll)
  .post(joiValidator(joiSchema.create), appConfig.add);
router
  .route("/:id")
  .get(appConfig.getById)
  .patch(joiValidator(joiSchema.update), appConfig.update)
  .delete(appConfig.delete);

module.exports = router;
