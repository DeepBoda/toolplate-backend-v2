"use strict";

const router = require("express").Router();
const Redirection = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(Redirection.getAll);
router.route("/check").post(Redirection.getOneByUrl);
router.route("/:id").get(Redirection.getById);



module.exports = router;
