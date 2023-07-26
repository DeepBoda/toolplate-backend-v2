"use strict";

const router = require("express").Router();
const blogTag = require("./controller");

router.route("/").get(blogTag.getAll);
router.route("/:id").get(blogTag.getById);



module.exports = router;
