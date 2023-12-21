"use strict";

const router = require("express").Router();
const toolImages = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router
  .route("/")
  .get(toolImages.getAll)
  .post(
    upload.fields([{ name: "previews", maxCount: 10 }]),
    joiValidator(joiSchema.create),
    toolImages.add
  );

router
  .route("/:id")
  .patch(joiValidator(joiSchema.update), toolImages.update)
  .delete(toolImages.delete);

module.exports = router;
