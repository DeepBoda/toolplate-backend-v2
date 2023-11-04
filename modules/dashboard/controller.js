const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const moment = require("moment");
const { dateFilter } = require("../../utils/service");
const userService = require("../user/service");
const toolService = require("../tool/service");
const blogService = require("../blog/service");
const categoryService = require("../category/service");
const notificationService = require("../notification/service");
const toolViewService = require("../toolView/service");
const blogViewService = require("../blogView/service");
const toolLikeService = require("../toolLike/service");
const blogLikeService = require("../blogLike/service");
const toolWishlistService = require("../toolWishlist/service");
const blogWishlistService = require("../blogWishlist/service");
const toolRatingService = require("../toolRating/service");
const blogCommentService = require("../blogComment/service");
const blogCommentReplyService = require("../blogCommentReply/service");

exports.overview = async (req, res, next) => {
  try {
    let { startDate, endDate } = req.query;
    if (moment(startDate).isAfter(endDate))
      return next(createError(200, "endDate must be larger than startDate."));
    let query = {};
    if (startDate && endDate)
      query = {
        where: {
          ...dateFilter(req.query),
        },
      };
    const [
      users,
      tools,
      blogs,
      categories,
      notifications,
      toolViews,
      blogViews,
      toolLikes,
      blogLikes,
      toolWishlists,
      blogWishlists,
      toolRatings,
      blogComments,
      blogCommentReplies,
    ] = await Promise.all([
      userService.count(query),
      toolService.count(query),
      blogService.count(query),
      categoryService.count(query),
      notificationService.count(query),
      toolViewService.count(query),
      blogViewService.count(query),
      toolLikeService.count(query),
      blogLikeService.count(query),
      toolWishlistService.count(query),
      blogWishlistService.count(query),
      toolRatingService.count(query),
      blogCommentService.count(query),
      blogCommentReplyService.count(query),
    ]);
    res.status(200).json({
      status: "success",
      data: {
        users,
        tools,
        blogs,
        categories,
        notifications,
        toolViews,
        blogViews,
        toolLikes,
        blogLikes,
        toolWishlists,
        blogWishlists,
        toolRatings,
        blogComments,
        blogCommentReplies,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin
// exports.adminUserDashboardOverview = async (req, res, next) => {
//   try {
//     let { startDate, endDate } = req.query;
//     if (moment(startDate).isAfter(endDate))
//       return next(createError(200, "endDate must be larger than startDate."));
//     let query = {};
//     if (startDate && endDate)
//       query = {
//         where: {
//           createdAt: {
//             [Op.between]: [
//               moment(startDate).utcOffset("+05:30"),
//               moment(endDate).utcOffset("+05:30"),
//             ],
//           },
//         },
//       };
//     const [
//       noOfUser,
//       noOfActiveUser,
//       noOfBlockedUser,
//       userDateStatics,
//       userMonthStatics,
//       userYearStatics,
//     ] = await Promise.all([
//       userService.count(query),
//       userService.count({ where: { isDeleted: 0, ...query?.where } }),
//       userService.count({ where: { isDeleted: 1, ...query?.where } }),
//       userService.count({
//         ...query,
//         group: [sequelize.fn("date", sequelize.col("createdAt"))],
//       }),
//       userService.count({
//         ...query,
//         group: [sequelize.fn("month", sequelize.col("createdAt"))],
//       }),
//       userService.count({
//         ...query,
//         group: [sequelize.fn("year", sequelize.col("createdAt"))],
//       }),
//     ]);

//     res.status(200).json({
//       status: "success",
//       data: {
//         noOfUser,
//         noOfActiveUser,
//         noOfBlockedUser,
//         userDateStatics,
//         userMonthStatics,
//         userYearStatics,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.tournamentDashboardOverview = async (req, res, next) => {
//   try {
//     let { startDate, endDate, type } = req.query;
//     if (moment(startDate).isAfter(endDate))
//       return next(createError(200, "endDate must be larger than startDate."));
//     let query = {};
//     if (startDate && endDate)
//       query = {
//         where: {
//           createdAt: {
//             [Op.between]: [
//               moment(startDate).utcOffset("+05:30"),
//               moment(endDate).utcOffset("+05:30"),
//             ],
//           },
//         },
//       };
//     if (type) {
//       query = {
//         ...query,
//         where: {
//           ...query?.where,
//           type,
//         },
//       };
//     }
//     const [
//       noOfTournaments,
//       noOfPlayedTournaments,
//       noOfCancelledTournaments,
//       tournamentDateStatics,
//       tournamentMonthStatics,
//       tournamentYearStatics,
//     ] = await Promise.all([
//       tournamentService.count(query),
//       tournamentService.count({
//         where: {
//           ...query.where,
//           isCancelled: false,
//         },
//       }),
//       tournamentService.count({
//         where: {
//           ...query.where,
//           isCancelled: true,
//         },
//       }),
//       tournamentService.count({
//         ...query,
//         group: [sequelize.fn("date", sequelize.col("startDate"))],
//       }),
//       tournamentService.count({
//         ...query,
//         group: [sequelize.fn("month", sequelize.col("startDate"))],
//       }),
//       tournamentService.count({
//         ...query,
//         group: [sequelize.fn("year", sequelize.col("startDate"))],
//       }),
//     ]);
//     res.status(200).json({
//       status: "success",
//       data: {
//         noOfTournaments,
//         noOfPlayedTournaments,
//         noOfCancelledTournaments,
//         tournamentDateStatics,
//         tournamentMonthStatics,
//         tournamentYearStatics,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
