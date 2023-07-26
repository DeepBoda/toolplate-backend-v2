"use strict";

const router = require("express").Router();
const category = require("./controller");
const categorySchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router.use(authMiddleware, protectRoute(["Admin"]));

router
  .route("/")
  .get(category.getAll)
  .post(joiValidator(categorySchema.create), category.add);
router
  .route("/:id")
  .get(category.getById)
  .patch(joiValidator(categorySchema.update), category.update)
  .delete(category.delete);

module.exports = router;
