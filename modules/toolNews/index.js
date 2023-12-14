"use strict";

const router = require("express").Router();
const news = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(news.getAll);
router.route("/:id").get(news.getById);



module.exports = router;
