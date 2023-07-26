"use strict";

const router = require("express").Router();
const blogTag = require("./controller");
const blogTagSchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router.use(authMiddleware, protectRoute(["Admin"]));

router
  .route("/")
  .get(blogTag.getAll)
  .post(joiValidator(blogTagSchema.create), blogTag.add);
router
  .route("/:id")
  .get(blogTag.getById)
  .patch(joiValidator(blogTagSchema.update), blogTag.update)
  .delete(blogTag.delete);

module.exports = router;
