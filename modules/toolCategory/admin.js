"use strict";

const router = require("express").Router();
const toolCategory = require("./controller");
const toolCategorySchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(toolCategory.getAll)
  .post(joiValidator(toolCategorySchema.create), toolCategory.add);
router
  .route("/:id")
  .get(toolCategory.getById)
  .patch(joiValidator(toolCategorySchema.update), toolCategory.update)
  .delete(toolCategory.delete);

module.exports = router;
