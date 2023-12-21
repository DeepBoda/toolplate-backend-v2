"use strict";

const router = require("express").Router();
const news = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(news.getAll)
  .post(joiValidator(joiSchema.create), news.add);
router
  .route("/:id")
  .get(news.getById)
  .patch(joiValidator(joiSchema.update), news.update)
  .delete(news.delete);

module.exports = router;
