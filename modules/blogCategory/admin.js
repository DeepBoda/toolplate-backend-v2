"use strict";

const router = require("express").Router();
const blogCategory = require("./controller");
const blogCategorySchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router.use(authMiddleware, protectRoute(["Admin"]));

router
  .route("/")
  .get(blogCategory.getAll)
  .post(joiValidator(blogCategorySchema.create), blogCategory.add);
router
  .route("/:id")
  .get(blogCategory.getById)
  .patch(joiValidator(blogCategorySchema.update), blogCategory.update)
  .delete(blogCategory.delete);

module.exports = router;
