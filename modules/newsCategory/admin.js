"use strict";

const router = require("express").Router();
const category = require("./controller");
const categorySchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router
  .route("/")
  .get(category.getAllForAdmin)
  .post(
    upload.single("image"),
    joiValidator(categorySchema.create),
    category.add
  );
router
  .route("/:id")
  .get(category.getById)
  .patch(
    upload.single("image"),
    joiValidator(categorySchema.update),
    category.update
  )
  .delete(category.delete);

module.exports = router;
