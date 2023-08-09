const express = require("express");
const router = express.Router();
const { authMiddleware, protectRoute } = require("../middlewares/auth");

router.use("/appConfig", require("../modules/appConfig"));
router.use("/users", require("../modules/user"));
router.use("/tool", require("../modules/tool"));
router.use("/toolTag", require("../modules/toolTag"));
router.use("/toolView", require("../modules/toolView"));
router.use("/toolLike", require("../modules/toolLike"));
router.use("/toolWishlist", require("../modules/toolWishlist"));
router.use("/toolCategory", require("../modules/toolCategory"));
router.use("/blog", require("../modules/blog"));
router.use("/category", require("../modules/category"));
router.use("/blogCategory", require("../modules/blogCategory"));
router.use("/tag", require("../modules/tag"));
router.use("/blogTag", require("../modules/blogTag"));
router.use("/blogView", require("../modules/blogView"));
router.use("/blogLike", require("../modules/blogLike"));
router.use("/comment", require("../modules/blogComment"));
router.use("/blogWishlist", require("../modules/blogWishlist"));
router.use("/commentLike", require("../modules/blogCommentLike"));
router.use("/comments/reply", require("../modules/blogCommentReply"));
router.use("/comments/replyLike", require("../modules/blogCommentReplyLike"));
// router.use("/temp", require("../modules/temp"));

module.exports = router;
