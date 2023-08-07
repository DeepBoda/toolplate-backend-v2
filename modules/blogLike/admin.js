"use strict";

const router = require("express").Router();
const like = require("./controller");
const likeSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(like.getAll)
  .post(joiValidator(likeSchema.create), like.likeBlog);
router
  .route("/:id")
  .get(like.getById)
  .patch(joiValidator(likeSchema.update), like.update)
  .delete(like.delete);

module.exports = router;
