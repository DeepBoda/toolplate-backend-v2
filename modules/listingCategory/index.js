"use strict";

const router = require("express").Router();
const listingCategory = require("./controller");
const {authMiddleware,protectRoute} = require("../../middlewares/auth");

router.use( authMiddleware);
router.route("/").get(listingCategory.getAll);
router.route("/:id").get(listingCategory.getById);



module.exports = router;
