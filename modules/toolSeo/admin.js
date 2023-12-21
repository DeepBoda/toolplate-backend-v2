"use strict";

const router = require("express").Router();
const Seo = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router.route("/").get(Seo.getAll);
router
  .route("/:toolId")
  .post(joiValidator(joiSchema.create), Seo.add)
  .get(Seo.getById);
// .patch(joiValidator(joiSchema.update), Seo.update)
// .delete(Seo.delete);

module.exports = router;
