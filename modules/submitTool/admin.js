"use strict";

const router = require("express").Router();
const submit = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router.route("/").get(submit.getAll);
router
  .route("/:id")
  .get(submit.getById)
  .patch(joiValidator(joiSchema.update), submit.update)
  .delete(submit.delete);

module.exports = router;
