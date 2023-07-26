const express = require("express");
const router = express.Router();
const { authMiddleware, protectRoute } = require("../middlewares/auth");

router.use("/", require("../modules/admin"));
router.use(authMiddleware);
router.use(protectRoute(["Admin"]));
router.use("/users", require("../modules/user/admin"));
router.use("/appConfig", require("../modules/appConfig/admin"));
router.use("/blog", require("../modules/blog/admin"));
router.use("/category", require("../modules/category/admin"));
module.exports = router;
