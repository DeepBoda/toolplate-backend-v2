"use strict";

const router = require("express").Router();
const tool = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(authMiddleware, tool.getAll);
router.route("/search").get(tool.search);
router.route("/promptSearch").get(tool.promptSearch);
router.route("/:slug").get(tool.getBySlug);
router.route("/related/:id").get(tool.getRelatedTools);
router.route("/data/:slug").get(tool.getDynamicBySlug);



module.exports = router;
