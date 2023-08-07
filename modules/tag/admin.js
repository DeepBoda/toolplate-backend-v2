"use strict";

const router = require("express").Router();
const tag = require("./controller");
const tagSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router.route("/").get(tag.getAll).post(joiValidator(tagSchema.create), tag.add);
router
  .route("/:id")
  .get(tag.getById)
  .patch(joiValidator(tagSchema.update), tag.update)
  .delete(tag.delete);

module.exports = router;
