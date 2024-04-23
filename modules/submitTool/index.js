"use strict";

const router = require("express").Router();
const category = require("./controller");
const { authMiddleware, protectRoute } = require("../../middlewares/auth");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router.use(authMiddleware)
router.route("/").post(  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "previews", maxCount: 3 }
  ]),joiValidator(joiSchema.create),category.add);

module.exports = router;
