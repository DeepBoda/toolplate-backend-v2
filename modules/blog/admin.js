"use strict";

const router = require("express").Router();
const blog = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router
  .route("/")
  .get(blog.getAllForAdmin)
  .post(upload.single("image"), joiValidator(joiSchema.create), blog.add);
router.route("/scheduled").get(blog.getScheduledForAdmin);
router
  .route("/:id")
  .get(blog.getForAdmin)
  .patch(upload.single("image"), joiValidator(joiSchema.update), blog.update)
  .delete(blog.delete);

module.exports = router;
