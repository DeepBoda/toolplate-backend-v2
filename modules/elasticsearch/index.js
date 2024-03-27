const router = require("express").Router();
const home = require("./controller");

router.route("/").post(home.elasticSearch);

module.exports = router;
