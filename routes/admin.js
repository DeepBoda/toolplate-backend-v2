const express = require("express");
const router = express.Router();
const { flushAll } = require("../utils/redis");
const { authMiddleware, protectRoute } = require("../middlewares/auth");

router.use("/", require("../modules/admin"));
router.use("/flush", flushAll);

router.use(authMiddleware, protectRoute(["Admin"]));
router.use("/users", require("../modules/user/admin"));
router.use("/appConfig", require("../modules/appConfig/admin"));
router.use("/notification", require("../modules/notification/admin"));
router.use("/tool", require("../modules/tool/admin"));
router.use("/tools/preview", require("../modules/toolImages/admin"));
router.use("/tools/rating", require("../modules/toolRating/admin"));
router.use("/toolLike", require("../modules/toolLike/admin"));
router.use("/toolTag", require("../modules/toolTag/admin"));
router.use("/toolCategory", require("../modules/toolCategory/admin"));
router.use("/tools/view", require("../modules/toolView/admin"));
router.use("/toolWishlist", require("../modules/toolWishlist/admin"));
router.use("/blog", require("../modules/blog/admin"));
router.use("/category", require("../modules/category/admin"));
router.use("/blogCategory", require("../modules/blogCategory/admin"));
router.use("/tag", require("../modules/tag/admin"));
router.use("/blogTag", require("../modules/blogTag/admin"));
router.use("/blogs/view", require("../modules/blogView/admin"));
router.use("/blogLike", require("../modules/blogLike/admin"));
router.use("/blogWishlist", require("../modules/blogWishlist/admin"));
router.use("/comment", require("../modules/blogComment/admin"));
router.use("/commentLike", require("../modules/blogCommentLike/admin"));
router.use("/comments/reply", require("../modules/blogCommentReply/admin"));
router.use(
  "/comments/replyLike",
  require("../modules/blogCommentReplyLike/admin")
);
module.exports = router;
