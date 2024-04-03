const router = require("express").Router();
const ES = require("../../utils/elastic");

router.route("/refill").post(ES.refillData);

module.exports = router;
