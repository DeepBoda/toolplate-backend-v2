"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Blog = require("../blog/model");
const User = require("../user/model");
const BlogComment = sequelize.define("blogComment", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Blog.hasMany(BlogComment, {
  foreignKey: {
    allowNull: false,
  },
});
BlogComment.belongsTo(Blog);

// without login blog can be accessible so userId not required
User.hasMany(BlogComment, {
  foreignKey: {
    allowNull: false,
  },
});
BlogComment.belongsTo(User);

module.exports = BlogComment;
