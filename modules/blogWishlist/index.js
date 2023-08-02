"use strict";

const router = require("express").Router();
const wishlist = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const wishlistSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router.use(authMiddleware,protectRoute(['User']));
router
  .route("/")
  .get(wishlist.getAll)
  .post(joiValidator(wishlistSchema.create), wishlist.add);
router
  .route("/:id")
  .get(wishlist.getById)
  .delete(wishlist.delete);


module.exports = router;
