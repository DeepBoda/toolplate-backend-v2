"use strict";

const router = require("express").Router();
const tool = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware);
router.route("/:slug").get(tool.getByCategorySlug);

module.exports = router;
