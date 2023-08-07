"use strict";

const router = require("express").Router();
const reply = require("./controller");

router.route("/").get(reply.getAll);
router.route("/:id").delete(reply.delete);

module.exports = router;
