"use strict";

const router = require("express").Router();
const user = require("./controller");

router.get("/", user.getAll);
router.get("/overview", user.overview);
router
  .route("/:id")
  .get(user.getById)
  .patch(user.blockUser)
  .delete(user.deleteById);

module.exports = router;
