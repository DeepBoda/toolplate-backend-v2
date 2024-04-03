"use strict";

const router = require("express").Router();
const view = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(view.getAll);
router.route("/data").get(view.getAllDynamic);



module.exports = router;
