"use strict";

const router = require("express").Router();
const blog = require("./controller");
const blogSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router
  .route("/")
  .get(blog.getAllForAdmin)
  .post(upload.single("image"), joiValidator(blogSchema.create), blog.add);
router;
router.route("/scheduled").get(blog.getScheduledForAdmin);
router
  .route("/:id")
  .get(blog.getForAdmin)
  .patch(upload.single("image"), joiValidator(blogSchema.update), blog.update)
  .delete(blog.delete);

module.exports = router;
