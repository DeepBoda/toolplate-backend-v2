"use strict";

const router = require("express").Router();
const prompt = require("./controller");
const promptSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(prompt.getAll)
  .post(joiValidator(promptSchema.create), prompt.add);
router
  .route("/:id")
  .get(prompt.getById)
  .patch(joiValidator(promptSchema.update), prompt.update)
  .delete(prompt.delete);

module.exports = router;
