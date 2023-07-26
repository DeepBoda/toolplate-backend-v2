"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Blog = require("../blog/model");
const User = require("../user/model");
const BlogComment = require("../blogComment/model");
const BlogCommentLike = sequelize.define(
  "blogCommentLike",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  {
    uniqueKeys: {
      blogCommentId_userId: {
        fields: ["blogCommentId", "userId"],
      },
    },
  }
);

BlogComment.hasMany(BlogCommentLike, {
  foreignKey: {
    allowNull: false,
  },
});
BlogCommentLike.belongsTo(BlogComment);

// without login blog can be accessible so userId not required
User.hasMany(BlogCommentLike, {
  foreignKey: {
    allowNull: false,
  },
});
BlogCommentLike.belongsTo(User);

module.exports = BlogCommentLike;
