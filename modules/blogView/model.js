"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Blog = require("../blog/model");
const User = require("../user/model");
const BlogView = sequelize.define(
  "blogView",
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
      blogId_userId: {
        fields: ["blogId", "userId"],
      },
    },
  }
);

Blog.hasMany(BlogView, {
  foreignKey: {
    allowNull: false,
  },
});
BlogView.belongsTo(Blog);

// without login blog can be accessible so userId not required
User.hasMany(BlogView);
BlogView.belongsTo(User);

module.exports = BlogView;
