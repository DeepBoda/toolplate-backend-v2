"use strict";

const router = require("express").Router();
const wishlist = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const { upload } = require("../../middlewares/multer");

router.use(authMiddleware, protectRoute(["Admin"]));

router.route("/").get(wishlist.getByUser);

module.exports = router;
