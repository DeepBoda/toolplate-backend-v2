"use strict";

const router = require("express").Router();
const tool = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.route("/search").get(tool.search);
router.use( authMiddleware);
router.route("/").get(authMiddleware, tool.getAll);
router.route("/related/:id").get(tool.getRelatedTools);
router.route("/data/:slug").get(tool.getDynamicBySlug);
router.route("/:slug").get(tool.getBySlug);



module.exports = router;
