"use strict";

const router = require("express").Router();
const reply = require("./controller");
const replySchema = require("./joiSchema");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router.use(authMiddleware, protectRoute(["Admin"]));

router.route("/").get(reply.getAll);
router.route("/:id").delete(reply.delete);

module.exports = router;
