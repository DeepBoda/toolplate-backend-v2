"use strict";

const router = require("express").Router();
const comment = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router
.route("/")
  .get(comment.getAll)

router.use( protectRoute(['User']));
router
.route("/")
  .post(joiValidator(joiSchema.create), comment.add);
router
  .route("/:id")
  .get(comment.getById);


module.exports = router;
