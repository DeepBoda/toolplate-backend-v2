"use strict";

const router = require("express").Router();
const rating = require("./controller");

router.route("/").get(rating.getByUser);

module.exports = router;
