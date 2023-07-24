"use strict";

const router = require("express").Router();
const appConfig = require("./controller");

router.route("/").get(appConfig.getOne);

module.exports = router;
