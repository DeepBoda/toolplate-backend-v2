"use strict";

const router = require("express").Router();
const home = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(home.getAllForAdmin)
  .post(joiValidator(joiSchema.create), home.add);
router
  .route("/:id")
  .get(home.getById)
  .patch(joiValidator(joiSchema.update), home.update)
  .delete(home.delete);

module.exports = router;
