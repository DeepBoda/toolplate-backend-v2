const router = require("express").Router();
const Cron = require("./controller");

router.route("/notification").post(Cron.notification);

module.exports = router;
