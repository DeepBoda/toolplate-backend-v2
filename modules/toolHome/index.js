"use strict";

const router = require("express").Router();
const home = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(home.getAll);
router.route("/data").get(home.getAllDynamic);


module.exports = router;
