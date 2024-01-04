"use strict";

const router = require("express").Router();
const category = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const { joiValidator } = require("../../middlewares/joiValidator");
const joiSchema = require("./joiSchema");

router.use(authMiddleware)
router.route("/").post( joiValidator(joiSchema.create),category.add);

module.exports = router;
