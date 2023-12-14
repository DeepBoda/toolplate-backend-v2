"use strict";

const router = require("express").Router();
const news = require("./controller");
const newsSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(news.getAll)
  .post(joiValidator(newsSchema.create), news.add);
router
  .route("/:id")
  .get(news.getById)
  .patch(joiValidator(newsSchema.update), news.update)
  .delete(news.delete);

module.exports = router;
