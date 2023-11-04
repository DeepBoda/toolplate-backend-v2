"use strict";

const router = require("express").Router();
const Seo = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(Seo.getAll);
router.route("/:toolId").get(Seo.getById);



module.exports = router;
