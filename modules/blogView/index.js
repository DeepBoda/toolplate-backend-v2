"use strict";

const router = require("express").Router();
const view = require("./controller");

router.route("/").get(view.getAll);
router.route("/:id").get(view.getById);



module.exports = router;
