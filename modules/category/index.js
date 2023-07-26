"use strict";

const router = require("express").Router();
const category = require("./controller");

router.route("/").get(category.getAll);
router.route("/:id").get(category.getById);



module.exports = router;
