"use strict";

const router = require("express").Router();
const { joiValidator } = require("../../middlewares/joiValidator");
const rating = require("./controller");
const joiSchema = require("./joiSchema");

router.route("/").get(rating.getAllForAdmin);
// router.route("/").get(rating.getByUser);
router
  .route("/:id")
  .patch(joiValidator(joiSchema.update), rating.update)
  .delete(rating.delete);

module.exports = router;
