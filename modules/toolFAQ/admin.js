"use strict";

const router = require("express").Router();
const FAQ = require("./controller");
const FAQSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router.route("/").get(FAQ.getAll).post(joiValidator(FAQSchema.create), FAQ.add);
router
  .route("/:toolId")
  .get(FAQ.getById)
  .patch(joiValidator(FAQSchema.update), FAQ.update)
  .delete(FAQ.delete);

module.exports = router;
