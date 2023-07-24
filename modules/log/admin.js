"use strict";

const router = require("express").Router();
const temp = require("./controller");

router
  .route("/")

  .get(temp.getAll);
router.route("/:id").get(temp.getById).delete(temp.delete);

module.exports = router;
