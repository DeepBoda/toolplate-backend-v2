"use strict";

const router = require("express").Router();
const blog = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(authMiddleware, blog.getAll);
router.route("/slugs").get(authMiddleware, blog.getSlugsForSitemap);
router.route("/data/:slug").get(blog.getDynamicBySlug);
router.route("/view/:id").get(blog.createView);
router.route("/related/:id").get(blog.getRelatedBlogs);
router.route("/:slug").get(blog.getBySlug);



module.exports = router;
