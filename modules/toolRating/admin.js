"use strict";

const router = require("express").Router();
const rating = require("./controller");

router.route("/").get(rating.getByUser);
router.route("/:id").delete(rating.delete);

module.exports = router;
