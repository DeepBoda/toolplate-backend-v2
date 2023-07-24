"use strict";

const router = require("express").Router();
const userFeedback = require("./controller");

router.route("/").get(userFeedback.getAll);
router.route("/:id").get(userFeedback.getById).delete(userFeedback.delete);

module.exports = router;
