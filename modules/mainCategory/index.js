"use strict";

const router = require("express").Router();
const MainCategory = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(MainCategory.getAll);
router.route("/slugs").get(MainCategory.getSlugsForSitemap);
router.route("/sitemap").get(MainCategory.getSitemap);
router.route("/:id").get(MainCategory.getById);



module.exports = router;
