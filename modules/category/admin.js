"use strict";

const router = require("express").Router();
const category = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(category.getAllForAdmin)
  .post(joiValidator(joiSchema.create), category.add);
router
  .route("/:id")
  .get(category.getById)
  .patch(joiValidator(joiSchema.update), category.update)
  .delete(category.delete);

module.exports = router;
