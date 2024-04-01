"use strict";

const router = require("express").Router();
const Redirection = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router
  .route("/")
  .get(Redirection.getAllForAdmin)
  .post(joiValidator(joiSchema.create), Redirection.add);
router
  .route("/:id")
  .get(Redirection.getById)
  .patch(joiValidator(joiSchema.update), Redirection.update)
  .delete(Redirection.delete);

module.exports = router;
