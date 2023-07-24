"use strict";

const router = require("express").Router();
const user = require("./controller");
const { protectRoute } = require("../../middlewares/auth");

router.use(protectRoute(["Admin"]));
router.get("/", user.getAll);
router.route("/:id").get(user.getById).delete(user.deleteById);

module.exports = router;
