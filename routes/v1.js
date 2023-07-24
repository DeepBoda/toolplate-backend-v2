const express = require("express");
const router = express.Router();
const { authMiddleware, protectRoute } = require("../middlewares/auth");

router.use("/appConfig", require("../modules/appConfig"));
router.use("/users", require("../modules/user"));
router.use(authMiddleware);
router.use(protectRoute(["User"]));
router.use("/temps", require("../modules/_temp"));
router.use("/userFeedback", require("../modules/userFeedback"));

module.exports = router;
