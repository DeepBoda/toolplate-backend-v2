"use strict";

const router = require("express").Router();
const toolCategory = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(toolCategory.getAll)
  .post(joiValidator(joiSchema.create), toolCategory.add);
router
  .route("/:id")
  .get(toolCategory.getById)
  .patch(joiValidator(joiSchema.update), toolCategory.update)
  .delete(toolCategory.delete);

module.exports = router;
