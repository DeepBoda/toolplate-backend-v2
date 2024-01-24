"use strict";

const router = require("express").Router();
const like = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(like.getAll)
  .post(joiValidator(joiSchema.create), like.add);
router
  .route("/:id")
  .get(like.getById)
  .patch(joiValidator(joiSchema.update), like.update)
  .delete(like.delete);

module.exports = router;
