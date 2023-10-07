"use strict";

const router = require("express").Router();
const blogTag = require("./controller");
const blogTagSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(blogTag.getAll)
  .post(joiValidator(blogTagSchema.create), blogTag.add);
router
  .route("/:id")
  .get(blogTag.getById)
  .patch(joiValidator(blogTagSchema.update), blogTag.update)
  .delete(blogTag.delete);

module.exports = router;
