const router = require("express").Router();
const home = require("./controller");

router.route("/").get(home.elasticSearch);

module.exports = router;
