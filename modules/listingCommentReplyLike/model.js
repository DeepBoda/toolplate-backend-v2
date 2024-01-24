"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../user/model");
const BlogCommentReply = require("../blogCommentReply/model");
const BlogCommentReplyLike = sequelize.define(
  "blogCommentReplyLike",
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
  //     blogCommentReplyId_userId: {
  //       fields: ["blogCommentReplyId", "userId"],
  //     },
  //   },
  // }
);

BlogCommentReply.hasMany(BlogCommentReplyLike, {
  foreignKey: {
    allowNull: false,
  },
});
BlogCommentReplyLike.belongsTo(BlogCommentReply);

// without login blog can be accessible so userId not required
User.hasMany(BlogCommentReplyLike, {
  foreignKey: {
    allowNull: false,
  },
});
BlogCommentReplyLike.belongsTo(User);

module.exports = BlogCommentReplyLike;
