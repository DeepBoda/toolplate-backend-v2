"use strict";

const router = require("express").Router();
const tag = require("./controller");

router.route("/").get(tag.getAll);
router.route("/:id").get(tag.getById);



module.exports = router;
