"use strict";

const router = require("express").Router();
const view = require("./controller");
const viewSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(view.getAll)
  .post(joiValidator(viewSchema.create), view.add);
router
  .route("/:id")
  .get(view.getById)
  .patch(joiValidator(viewSchema.update), view.update)
  .delete(view.delete);

module.exports = router;
