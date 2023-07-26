const express = require("express");
const router = express.Router();
const { authMiddleware, protectRoute } = require("../middlewares/auth");

router.use("/appConfig", require("../modules/appConfig"));
router.use("/users", require("../modules/user"));
router.use("/blog", require("../modules/blog"));
router.use("/category", require("../modules/category"));
router.use("/blogCategory", require("../modules/blogCategory"));
router.use("/tag", require("../modules/tag"));
router.use(authMiddleware);
router.use(protectRoute(["User"]));
// router.use("/userFeedback", require("../modules/userFeedback"));

module.exports = router;
