"use strict";

const router = require("express").Router();
const likeSchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const { joiValidator } = require("../../middlewares/joiValidator");
const like = require("./controller");

router.use(authMiddleware,)
router
  .route("/")
    .get(like.getAll)

router.use( protectRoute(["User"]));

router.route("/").post(joiValidator(likeSchema.create),like.likeTool);




module.exports = router;
