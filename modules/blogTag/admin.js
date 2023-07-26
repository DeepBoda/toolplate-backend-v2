"use strict";

const router = require("express").Router();
const blog = require("./controller");
const blogSchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router.use(authMiddleware, protectRoute(["Admin"]));

router
  .route("/")
  .get(blog.getAll)
  .post(joiValidator(blogSchema.create), blog.add);
router
  .route("/:id")
  .get(blog.getById)
  .patch(joiValidator(blogSchema.update), blog.update)
  .delete(blog.delete);

module.exports = router;
