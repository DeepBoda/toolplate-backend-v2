"use strict";

const router = require("express").Router();
const news = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router
  .route("/")
  .get(news.getAllForAdmin)
  .post(upload.single("image"), joiValidator(joiSchema.create), news.add);
router;
router
  .route("/:id")
  .get(news.getForAdmin)
  .patch(upload.single("image"), joiValidator(joiSchema.update), news.update)
  .delete(news.delete);

module.exports = router;
