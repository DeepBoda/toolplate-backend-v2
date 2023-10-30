"use strict";

const router = require("express").Router();
const FAQ = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(FAQ.getAll);
router.route("/:toolId").get(FAQ.getById);



module.exports = router;
