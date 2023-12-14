"use strict";

const router = require("express").Router();
const wishlist = require("./controller");

router.route("/").get(wishlist.getByUser);

module.exports = router;
