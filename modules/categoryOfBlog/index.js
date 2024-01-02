"use strict";

const router = require("express").Router();
const category = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");

router.use(authMiddleware,)
router.route("/").get(category.getAll);
router.route("/slugs").get(category.getSlugsForSitemap);
router.route("/:id").get(category.getById);



module.exports = router;
