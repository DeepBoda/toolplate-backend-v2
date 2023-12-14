"use strict";

const router = require("express").Router();
const news = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware);
router.route("/:slug").get(news.getByCategorySlug);

module.exports = router;
