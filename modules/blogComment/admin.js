"use strict";

const router = require("express").Router();
const comment = require("./controller");

router.route("/").get(comment.getAllForAdmin);
router.route("/:id").delete(comment.delete);

module.exports = router;
