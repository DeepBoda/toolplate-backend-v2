"use strict";

const router = require("express").Router();
const tag = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(tag.promptSearch);

module.exports = router;
