"use strict";

const router = require("express").Router();
const blogCategory = require("./controller");

router.route("/").get(blogCategory.getAll);
router.route("/:id").get(blogCategory.getById);



module.exports = router;
