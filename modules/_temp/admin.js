"use strict";

const router = require("express").Router();
const temp = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .post(joiValidator(joiSchema.create), temp.add)
  .get(temp.getAll);
router
  .route("/:id")
  .get(temp.getById)
  .patch(joiValidator(joiSchema.update), temp.update)
  .delete(temp.delete);

module.exports = router;
