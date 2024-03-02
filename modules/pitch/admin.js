"use strict";

const router = require("express").Router();
const pitch = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(pitch.getAll)
  .post(joiValidator(joiSchema.create), pitch.add);
router
  .route("/:id")
  .get(pitch.getById)
  .patch(joiValidator(joiSchema.update), pitch.update)
  .delete(pitch.delete);

module.exports = router;
