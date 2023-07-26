"use strict";

const router = require("express").Router();
const reply = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const replySchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router.use(authMiddleware,protectRoute(['User']));
router
  .route("/")
  .get(reply.getAll)
  .post(joiValidator(replySchema.create), reply.add);
router
  .route("/:id")
  .get(reply.getById);


module.exports = router;
