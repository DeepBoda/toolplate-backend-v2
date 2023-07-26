"use strict";

const router = require("express").Router();
const comment = require("./controller");
const commentSchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router.use(authMiddleware, protectRoute(["Admin"]));

router.route("/").get(comment.getAll);
router
  .route("/:id")
  .get(comment.getById)
  .patch(joiValidator(commentSchema.update), comment.update)
  .delete(comment.delete);

module.exports = router;
