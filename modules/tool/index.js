"use strict";

const router = require("express").Router();
const tool = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware);
router.route("/").get(authMiddleware, tool.getAll);
router.route("/count").get(authMiddleware, tool.getAllCounts);
router.route("/all").get(authMiddleware, tool.getAllDynamic);
router.route("/schema").get(authMiddleware, tool.getAllForSchema);
router.route("/search").get(tool.search);
router.route("/slugs").get(tool.getSlugsForSitemap);
router.route("/data/:slug").get(tool.getDynamicBySlug);
router.route("/view/:id").get(authMiddleware, tool.createView);
router.route("/related/category/:slug").get(tool.getRelatedCategories);
router.route("/related/:slug").get(tool.getRelatedTools);
router.route("/related-data/:slug").get(tool.getRelatedToolsDynamic);
router.route("/alt/slugs").get(tool.getSlugsForAlterativeSitemap);
router.route("/alt/count/:slug").get(tool.getAlternativeToolsCount);
router.route("/alt/:slug").get(tool.getAlternativeTools);
router.route("/alt-data/:slug").get(tool.getAlternativeDynamicTools);
router.route("/alt-schema/:slug").get(tool.getAlternativeSchema);
router.route("/:slug").get(tool.getBySlug);



module.exports = router;
