"use strict";

const router = require("express").Router();
const blogCategory = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(blogCategory.getAll)
  .post(joiValidator(joiSchema.create), blogCategory.add);
router
  .route("/:id")
  .get(blogCategory.getById)
  .patch(joiValidator(joiSchema.update), blogCategory.update)
  .delete(blogCategory.delete);

module.exports = router;
