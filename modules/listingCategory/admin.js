"use strict";

const router = require("express").Router();
const listingCategory = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(listingCategory.getAll)
  .post(joiValidator(joiSchema.create), listingCategory.add);
router
  .route("/:id")
  .get(listingCategory.getById)
  .patch(joiValidator(joiSchema.update), listingCategory.update)
  .delete(listingCategory.delete);

module.exports = router;
