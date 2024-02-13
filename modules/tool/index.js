"use strict";

const router = require("express").Router();
const tool = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(authMiddleware, tool.getAll);
router.route("/all").get(authMiddleware, tool.getAllDynamic);
router.route("/search").get(tool.search);
router.route("/slugs").get(tool.getSlugsForSitemap);
router.route("/data/:slug").get(tool.getDynamicBySlug);
router.route("/view/:id").get(authMiddleware, tool.createView);
router.route("/related/:id").get(tool.getRelatedTools);
router.route("/alt/:slug").get(tool.getAlternativeTools);
router.route("/alt-data/:slug").get(tool.getAlternativeDynamicTools);
router.route("/alt-schema/:slug").get(tool.getAlternativeSchema);
router.route("/:slug").get(tool.getBySlug);



module.exports = router;
