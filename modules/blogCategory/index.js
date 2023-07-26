"use strict";

const router = require("express").Router();
const blog = require("./controller");

router.route("/").get(blog.getAll);
router.route("/:id").get(blog.getById);



module.exports = router;
