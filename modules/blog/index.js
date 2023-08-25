"use strict";

const router = require("express").Router();
const blog = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(authMiddleware, blog.getAll);
router.route("/related/:id").get(blog.getRelatedBlogs);
router.route("/:slug").get(blog.getById);



module.exports = router;
