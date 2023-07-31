"use strict";

const router = require("express").Router();
const blog = require("./controller");

router.route("/").get(blog.getAll);
router.route("/related/:id").get(blog.getRelatedBlogs);
router.route("/:id").get(blog.getById);



module.exports = router;
