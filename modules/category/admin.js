"use strict";

const router = require("express").Router();
const category = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router
  .route("/")
  .get(category.getAllForAdmin)
  .post(upload.single("image"), joiValidator(joiSchema.create), category.add);
router.route("/empty").get(category.getAllEmpty);
router
  .route("/:id")
  .get(category.getById)
  .patch(
    upload.single("image"),
    joiValidator(joiSchema.update),
    category.update
  )
  .delete(category.delete);

module.exports = router;
