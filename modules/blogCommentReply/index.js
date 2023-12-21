"use strict";

const router = require("express").Router();
const reply = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router.use(authMiddleware,protectRoute(['User']));
router
  .route("/")
  .get(reply.getAll)
  .post(joiValidator(joiSchema.create), reply.add);
router
  .route("/:id")
  .get(reply.getById);


module.exports = router;
