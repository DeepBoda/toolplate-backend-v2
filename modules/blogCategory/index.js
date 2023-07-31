"use strict";

const router = require("express").Router();
const blogCategory = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(blogCategory.getAll);
router.route("/:id").get(blogCategory.getById);



module.exports = router;
