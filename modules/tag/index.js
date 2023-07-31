"use strict";

const router = require("express").Router();
const tag = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(tag.getAll);
router.route("/:id").get(tag.getById);



module.exports = router;
