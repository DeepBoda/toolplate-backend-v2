"use strict";

const router = require("express").Router();
const blogTag = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(blogTag.getAll);
router.route("/:id").get(blogTag.getById);



module.exports = router;
