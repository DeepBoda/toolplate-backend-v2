"use strict";

const router = require("express").Router();
const wishlist = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router.use(authMiddleware,protectRoute(['User']));
router
  .route("/")
  .get(wishlist.getAll)
  .post(joiValidator(joiSchema.create), wishlist.add);

module.exports = router;
