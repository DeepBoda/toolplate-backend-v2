"use strict";

const router = require("express").Router();
const blog = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(blog.getAll);
router.route("/all").get( blog.getAllDynamic);
router.route("/slugs").get(blog.getSlugsForSitemap);
router.route("/schema").get(authMiddleware, blog.getAllForSchema);
router.route("/data/:slug").get(blog.getDynamicBySlug);
router.route("/view/:id").get(blog.createView);
router.route("/related/:slug").get(blog.getRelatedBlogs);
router.route("/related-data/:slug").get(blog.getRelatedBlogsDynamic);
router.route("/:slug").get(blog.getBySlug);



module.exports = router;
