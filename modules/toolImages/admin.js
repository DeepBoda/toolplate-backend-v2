"use strict";

const router = require("express").Router();
const toolImages = require("./controller");
const toolImagesSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router
  .route("/")
  .get(toolImages.getAll)
  .post(
    upload.single("image"),
    joiValidator(toolImagesSchema.create),
    toolImages.add
  );

router.route("/:id").delete(toolImages.delete);

module.exports = router;
