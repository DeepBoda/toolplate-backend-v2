"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../user/model");
const ListingCommentReply = require("../listingCommentReply/model");
const ListingCommentReplyLike = sequelize.define(
  "listingCommentReplyLike",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
  }
  // {
  //   uniqueKeys: {
  //     listingCommentReplyId_userId: {
  //       fields: ["listingCommentReplyId", "userId"],
  //     },
  //   },
  // }
);

ListingCommentReply.hasMany(ListingCommentReplyLike, {
  foreignKey: {
    allowNull: false,
  },
});
ListingCommentReplyLike.belongsTo(ListingCommentReply);

// without login listing can be accessible so userId not required
User.hasMany(ListingCommentReplyLike, {
  foreignKey: {
    allowNull: false,
  },
});
ListingCommentReplyLike.belongsTo(User);

module.exports = ListingCommentReplyLike;
