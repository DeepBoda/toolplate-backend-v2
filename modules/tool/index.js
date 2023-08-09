"use strict";

const router = require("express").Router();
const tool = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(authMiddleware, tool.getAll);
router.route("/related/:id").get(tool.getRelatedTools);
router.route("/:id").get(tool.getById);



module.exports = router;
