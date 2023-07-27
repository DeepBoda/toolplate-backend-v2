"use strict";

const router = require("express").Router();
const comment = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const commentSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
.route("/")
.get(comment.getAll)
router.use(authMiddleware, protectRoute(['User']));
router
.route("/")
  .post(joiValidator(commentSchema.create), comment.add);
router
  .route("/:id")
  .get(comment.getById);


module.exports = router;
