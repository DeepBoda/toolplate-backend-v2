"use strict";

const router = require("express").Router();
const rating = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router.use(authMiddleware);
router.
  route("/")
  .get(rating.getAll);
  router.
  route("/data/:slug")
  .get(rating.getBySlug);

router.use(protectRoute(['User']));
router
  .route("/")
  .post(joiValidator(joiSchema.create), rating.add);

module.exports = router;
