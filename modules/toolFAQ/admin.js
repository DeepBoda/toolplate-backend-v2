"use strict";

const router = require("express").Router();
const FAQ = require("./controller");
const FAQSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router.route("/").get(FAQ.getAll);
router
  .route("/:toolId")
  .post(joiValidator(FAQSchema.create), FAQ.add)
  .get(FAQ.getById);
// .patch(joiValidator(FAQSchema.update), FAQ.update)
// .delete(FAQ.delete);

module.exports = router;
