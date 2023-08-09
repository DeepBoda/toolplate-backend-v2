"use strict";

const router = require("express").Router();
const toolTag = require("./controller");
const toolTagSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(toolTag.getAll)
  .post(joiValidator(toolTagSchema.create), toolTag.add);
router
  .route("/:id")
  .get(toolTag.getById)
  .patch(joiValidator(toolTagSchema.update), toolTag.update)
  .delete(toolTag.delete);

module.exports = router;
