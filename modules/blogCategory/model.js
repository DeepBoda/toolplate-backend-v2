"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Blog = require("../blog/model");
const Category = require("../category/model");
const BlogCategory = sequelize.define(
  "blogCategory",
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
      blogId_categoryId: {
        fields: ["blogId", "categoryId"],
      },
    },
  }
);

Blog.hasMany(BlogCategory, {
  foreignKey: {
    allowNull: false,
  },
});
BlogCategory.belongsTo(Blog);
Category.hasMany(BlogCategory, {
  foreignKey: {
    allowNull: false,
  },
});
BlogCategory.belongsTo(Category);

module.exports = BlogCategory;
