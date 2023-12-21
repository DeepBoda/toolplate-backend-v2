"use strict";

const router = require("express").Router();
const prompt = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(prompt.getAll)
  .post(joiValidator(joiSchema.create), prompt.add);
router
  .route("/:id")
  .get(prompt.getById)
  .patch(joiValidator(joiSchema.update), prompt.update)
  .delete(prompt.delete);

module.exports = router;
