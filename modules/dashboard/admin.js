const router = require("express").Router();
const { overview } = require("./controller");

router.route("/user").get(overview);

module.exports = router;
