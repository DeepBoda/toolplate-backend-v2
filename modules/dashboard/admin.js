const router = require("express").Router();
const { overview, users, userData } = require("./controller");

router.route("/").get(overview);
router.route("/users").get(users);
router.route("/user/:userId").get(userData);

module.exports = router;
