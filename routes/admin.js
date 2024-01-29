const express = require("express");
const router = express.Router();
const { flushAll } = require("../utils/redis");
const { authMiddleware, protectRoute } = require("../middlewares/auth");

router.use("/", require("../modules/admin"));
router.use("/flush", flushAll);

router.use(authMiddleware, protectRoute(["Admin"]));
router.use("/users", require("../modules/user/admin"));
router.use("/dashboard", require("../modules/dashboard/admin"));
router.use("/appConfig", require("../modules/appConfig/admin"));
router.use("/notification", require("../modules/notification/admin"));
router.use("/prompt", require("../modules/prompt/admin"));
router.use("/tool", require("../modules/tool/admin"));
router.use("/toolSeo", require("../modules/toolSeo/admin"));
router.use("/tools/preview", require("../modules/toolImages/admin"));
router.use("/tools/rating", require("../modules/toolRating/admin"));
router.use("/toolLike", require("../modules/toolLike/admin"));
router.use("/toolCategory", require("../modules/toolCategory/admin"));
router.use("/tools/view", require("../modules/toolView/admin"));
router.use("/toolWishlist", require("../modules/toolWishlist/admin"));
router.use("/blog", require("../modules/blog/admin"));
router.use("/blogSeo", require("../modules/blogSeo/admin"));
router.use("/category", require("../modules/category/admin"));
router.use("/category-blog", require("../modules/categoryOfBlog/admin"));
router.use("/category-listing", require("../modules/categoryOfListing/admin"));
router.use("/main-category", require("../modules/mainCategory/admin"));
router.use("/blogCategory", require("../modules/blogCategory/admin"));
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
router.use("/newsCategory", require("../modules/newsCategory/admin"));
router.use("/news", require("../modules/news/admin"));
router.use("/newsWishlist", require("../modules/newsWishlist/admin"));
router.use("/newsViews", require("../modules/newsView/admin"));
router.use("/listing", require("../modules/listing/admin"));
router.use("/listings/view", require("../modules/listingView/admin"));
router.use("/listingLike", require("../modules/listingLike/admin"));
router.use("/submit-tool", require("../modules/submitTool/admin"));
router.use("/listing-comment", require("../modules/listingComment/admin"));
router.use(
  "/listing-commentLike",
  require("../modules/listingCommentLike/admin")
);
router.use(
  "/listing-comments/reply",
  require("../modules/listingCommentReply/admin")
);
router.use(
  "/listing-comments/replyLike",
  require("../modules/listingCommentReplyLike/admin")
);

module.exports = router;
