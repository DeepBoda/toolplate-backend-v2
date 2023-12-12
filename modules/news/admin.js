"use strict";

const router = require("express").Router();
const news = require("./controller");
const newsSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router
  .route("/")
  .get(news.getAllForAdmin)
  .post(upload.single("image"), joiValidator(newsSchema.create), news.add);
router;
router
  .route("/:id")
  .get(news.getForAdmin)
  .patch(upload.single("image"), joiValidator(newsSchema.update), news.update)
  .delete(news.delete);

module.exports = router;
