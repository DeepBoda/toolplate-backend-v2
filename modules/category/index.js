"use strict";

const router = require("express").Router();
const category = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(category.getAll);
router.route("/main").post(category.getByMain);
router.route("/main-data").post(category.getByMainDynamic);
router.route("/slugs").get(category.getSlugsForSitemap);
router.route("/sitemap").get(category.getSitemap);
router.route("/:slug").get(category.getBySlug);



module.exports = router;
