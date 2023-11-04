"use strict";

const router = require("express").Router();
const prompt = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(prompt.promptSearch);

module.exports = router;
