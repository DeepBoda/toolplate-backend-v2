"use strict";

const router = require("express").Router();
const Notification = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(Notification.getAll);
router.route("/click").post(Notification.clicks);
router.route("/:id").get(Notification.getById);



module.exports = router;
