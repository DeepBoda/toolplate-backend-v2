"use strict";

const router = require("express").Router();
const Seo = require("./controller");
const SeoSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router.route("/").get(Seo.getAll);
router
  .route("/:blogId")
  .post(joiValidator(SeoSchema.create), Seo.add)
  .get(Seo.getById);
// .patch(joiValidator(SeoSchema.update), Seo.update)
// .delete(Seo.delete);

module.exports = router;
