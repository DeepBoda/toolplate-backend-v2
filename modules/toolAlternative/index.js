"use strict";

const router = require("express").Router();
const Alternative = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(Alternative.getAll);
router.route("/:slug").get(Alternative.getBySlug);



module.exports = router;
