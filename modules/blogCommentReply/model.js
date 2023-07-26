"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const BlogComment = require("../blogComment/model");
const User = require("../user/model");
const BlogCommentReply = sequelize.define("blogCommentReply", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

BlogComment.hasMany(BlogCommentReply, {
  foreignKey: {
    allowNull: false,
  },
});
BlogCommentReply.belongsTo(BlogComment);

// without login blog can be accessible so userId not required
User.hasMany(BlogCommentReply, {
  foreignKey: {
    allowNull: false,
  },
});
BlogCommentReply.belongsTo(User);

module.exports = BlogCommentReply;
