"use strict";

const router = require("express").Router();
const view = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(view.getAll)
  .post(joiValidator(joiSchema.create), view.add);
router
  .route("/:id")
  .get(view.getById)
  .patch(joiValidator(joiSchema.update), view.update)
  .delete(view.delete);

module.exports = router;
