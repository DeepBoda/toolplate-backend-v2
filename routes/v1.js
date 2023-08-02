const express = require("express");
const router = express.Router();
const { authMiddleware, protectRoute } = require("../middlewares/auth");

router.use("/appConfig", require("../modules/appConfig"));
router.use("/users", require("../modules/user"));
router.use("/blog", require("../modules/blog"));
router.use("/category", require("../modules/category"));
router.use("/blogCategory", require("../modules/blogCategory"));
router.use("/tag", require("../modules/tag"));
router.use("/blogTag", require("../modules/blogTag"));
router.use("/blogView", require("../modules/blogView"));
router.use("/blogLike", require("../modules/blogLike"));
router.use("/comment", require("../modules/blogComment"));
router.use(authMiddleware);
router.use(protectRoute(["User"]));
router.use("/blogWishlist", require("../modules/blogWishlist"));
router.use("/commentLike", require("../modules/blogCommentLike"));
router.use("/comments/reply", require("../modules/blogCommentReply"));
router.use("/comments/replyLike", require("../modules/blogCommentReplyLike"));
// router.use("/userFeedback", require("../modules/userFeedback"));

module.exports = router;
