"use strict";

const router = require("express").Router();
const submitToolCategory = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(submitToolCategory.getAll);
router.route("/:id").get(submitToolCategory.getById);



module.exports = router;
