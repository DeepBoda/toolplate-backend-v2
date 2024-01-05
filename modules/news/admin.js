"use strict";

const router = require("express").Router();
const News = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router
  .route("/")
  .get(News.getAllForAdmin)
  .post(upload.single("image"), joiValidator(joiSchema.create), News.add);
router.route("/scheduled").get(News.getScheduledForAdmin);

router
  .route("/:id")
  .get(News.getForAdmin)
  .patch(upload.single("image"), joiValidator(joiSchema.update), News.update)
  .delete(News.delete);

module.exports = router;
