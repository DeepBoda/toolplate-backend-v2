"use strict";

const router = require("express").Router();
const toolCategory = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(toolCategory.getAll);
router.route("/:id").get(toolCategory.getById);



module.exports = router;
