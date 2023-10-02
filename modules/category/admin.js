"use strict";

const router = require("express").Router();
const category = require("./controller");
const categorySchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(category.getAllForAdmin)
  .post(joiValidator(categorySchema.create), category.add);
router
  .route("/:id")
  .get(category.getById)
  .patch(joiValidator(categorySchema.update), category.update)
  .delete(category.delete);

module.exports = router;
