"use strict";

const router = require("express").Router();
const listing = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");
const { upload } = require("../../middlewares/multer");

router
  .route("/")
  .get(listing.getAllForAdmin)
  .post(upload.single("image"), joiValidator(joiSchema.create), listing.add);
router.route("/all").get(listing.getAllForDropDown);
router
  .route("/meta/:id")
  .get(listing.getMetaForAdmin)
  .patch(joiValidator(joiSchema.meta), listing.updateMeta);

router
  .route("/:id")
  .get(listing.getForAdmin)
  .patch(upload.single("image"), joiValidator(joiSchema.update), listing.update)
  .delete(listing.delete);

module.exports = router;
