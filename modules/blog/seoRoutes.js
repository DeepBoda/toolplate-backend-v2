"use strict";

const router = require("express").Router();
const blog = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware);
router.route("/:slug").get(blog.getByCategorySlug);

module.exports = router;
