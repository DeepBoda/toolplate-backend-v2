const express = require("express");
const router = express.Router();

router.use("/appConfig", require("../modules/appConfig"));
router.use("/users", require("../modules/user"));
router.use("/prompt", require("../modules/prompt"));
router.use("/notification", require("../modules/notification"));
router.use("/home/tool", require("../modules/toolHome"));
router.use("/home/blog", require("../modules/blogHome"));
router.use("/home/listing", require("../modules/listingHome"));
router.use("/main-category", require("../modules/mainCategory"));
router.use("/category", require("../modules/category"));
router.use("/category-blog", require("../modules/categoryOfBlog"));
router.use("/category-listing", require("../modules/categoryOfListing"));
router.use("/tool", require("../modules/tool"));
router.use("/toolSeo", require("../modules/toolSeo"));
router.use("/tools/rating", require("../modules/toolRating"));
router.use("/tools", require("../modules/tool/seoRoutes"));
router.use("/toolLike", require("../modules/toolLike"));
router.use("/toolWishlist", require("../modules/toolWishlist"));
router.use("/blog", require("../modules/blog"));
router.use("/blogSeo", require("../modules/blogSeo"));
router.use("/blogs", require("../modules/blog/seoRoutes"));
router.use("/blogLike", require("../modules/blogLike"));
router.use("/blogWishlist", require("../modules/blogWishlist"));
router.use("/comment", require("../modules/blogComment"));
router.use("/commentLike", require("../modules/blogCommentLike"));
router.use("/comments/reply", require("../modules/blogCommentReply"));
router.use("/comments/replyLike", require("../modules/blogCommentReplyLike"));
router.use("/newsCategory", require("../modules/newsCategory"));
router.use("/news", require("../modules/news"));
router.use("/allNews", require("../modules/news/seoRoutes"));
router.use("/newsWishlist", require("../modules/newsWishlist"));
router.use("/toolNews", require("../modules/toolNews"));
router.use("/listing", require("../modules/listing"));
router.use("/listings", require("../modules/listing/seoRoutes"));
router.use("/listingLike", require("../modules/listingLike"));
router.use("/listingWishlist", require("../modules/listingWishlist"));
router.use("/listing-comment", require("../modules/listingComment"));
router.use("/listing-commentLike", require("../modules/listingCommentLike"));
router.use(
  "/listing-comments/reply",
  require("../modules/listingCommentReply")
);
router.use(
  "/listing-comments/replyLike",
  require("../modules/listingCommentReplyLike")
);
router.use("/submit-tool", require("../modules/submitTool"));
// router.use("/elasticsearch", require("../modules/elasticsearch"));

module.exports = router;
