"use strict";

const router = require("express").Router();
const Alternative = require("./controller");
const joiSchema = require("./joiSchema");
const { joiValidator } = require("../../middlewares/joiValidator");

router.route("/").get(Alternative.getAll);
router
  .route("/:toolId")
  .post(joiValidator(joiSchema.create), Alternative.add)
  .get(Alternative.getById);
// .patch(joiValidator(joiSchema.update), Alternative.update)
// .delete(Alternative.delete);

module.exports = router;
