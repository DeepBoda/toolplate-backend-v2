const express = require("express");
const { validateAPIKey } = require("../middlewares/auth");
const router = express.Router();

router.use("/api/v1/admin", require("./admin"));
router.use("/api/v1", require("./user"));

module.exports = router;
