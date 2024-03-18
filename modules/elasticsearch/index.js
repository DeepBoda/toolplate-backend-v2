const router = require("express").Router();
const home = require("./controller");

router.route("/:search").get(home.elasticSearch);

module.exports = router;
