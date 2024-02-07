"use strict";

const router = require("express").Router();
const submitToolCategory = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(submitToolCategory.getAll)
  .post(joiValidator(joiSchema.create), submitToolCategory.add);
router
  .route("/:id")
  .get(submitToolCategory.getById)
  .patch(joiValidator(joiSchema.update), submitToolCategory.update)
  .delete(submitToolCategory.delete);

module.exports = router;
