"use strict";

const router = require("express").Router();
const MainCategory = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router
  .route("/")
  .get(MainCategory.getAllForAdmin)
  .post(
    upload.single("image"),
    joiValidator(joiSchema.create),
    MainCategory.add
  );
router
  .route("/:id")
  .get(MainCategory.getById)
  .patch(
    upload.single("image"),
    joiValidator(joiSchema.update),
    MainCategory.update
  )
  .delete(MainCategory.delete);

module.exports = router;
