"use strict";

const router = require("express").Router();
const like = require("./controller");
const likeSchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router.use(authMiddleware, protectRoute(["Admin"]));

router
  .route("/")
  .get(like.getAll)
  .post(joiValidator(likeSchema.create), like.add);
router
  .route("/:id")
  .get(like.getById)
  .patch(joiValidator(likeSchema.update), like.update)
  .delete(like.delete);

module.exports = router;
