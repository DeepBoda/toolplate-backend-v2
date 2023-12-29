"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Blog = require("../blog/model");
const CategoryOfBlog = require("../categoryOfBlog/model");
const BlogCategory = sequelize.define("blogCategory", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
});

Blog.hasMany(BlogCategory, {
  foreignKey: {
    allowNull: false,
  },
});
BlogCategory.belongsTo(Blog);

CategoryOfBlog.hasMany(BlogCategory, {
  foreignKey: {
    allowNull: false,
  },
});
BlogCategory.belongsTo(CategoryOfBlog);

module.exports = BlogCategory;
