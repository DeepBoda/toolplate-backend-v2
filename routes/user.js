const express = require("express");
const router = express.Router();

router.use("/appConfig", require("../modules/appConfig"));
router.use("/users", require("../modules/user"));
router.use("/prompt", require("../modules/prompt"));
router.use("/category", require("../modules/category"));
router.use("/tag", require("../modules/tag"));
router.use("/tool", require("../modules/tool"));
router.use("/tools/faq", require("../modules/toolFAQ"));
router.use("/tools/rating", require("../modules/toolRating"));
router.use("/toolLike", require("../modules/toolLike"));
router.use("/toolWishlist", require("../modules/toolWishlist"));
router.use("/blog", require("../modules/blog"));
router.use("/blogLike", require("../modules/blogLike"));
router.use("/comment", require("../modules/blogComment"));
router.use("/blogWishlist", require("../modules/blogWishlist"));
router.use("/commentLike", require("../modules/blogCommentLike"));
router.use("/comments/reply", require("../modules/blogCommentReply"));
router.use("/comments/replyLike", require("../modules/blogCommentReplyLike"));

module.exports = router;
