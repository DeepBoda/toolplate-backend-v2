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
router.use("/blogCategory", require("../modules/blogCategory/admin"));
router.use("/tag", require("../modules/tag/admin"));
router.use("/blogTag", require("../modules/blogTag/admin"));
router.use("/blogView", require("../modules/blogView/admin"));
module.exports = router;
