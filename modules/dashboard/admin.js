const router = require("express").Router();
const { overview } = require("./controller");

router.route("/").get(overview);

module.exports = router;
