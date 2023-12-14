"use strict";

const router = require("express").Router();
const news = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(authMiddleware, news.getAll);
router.route("/view/:id").get(news.createView);
router.route("/:slug").get(news.getBySlug);

module.exports = router;
