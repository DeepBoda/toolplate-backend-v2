"use strict";

const router = require("express").Router();
const toolTag = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(toolTag.getAll);
router.route("/:id").get(toolTag.getById);



module.exports = router;
