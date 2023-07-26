"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Blog = require("../blog/model");
const User = require("../user/model");
const BlogLike = sequelize.define(
  "blogLike",
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

Blog.hasMany(BlogLike, {
  foreignKey: {
    allowNull: false,
  },
});
BlogLike.belongsTo(Blog);

// without login blog can be accessible so userId not required
User.hasMany(BlogLike, {
  foreignKey: {
    allowNull: false,
  },
});
BlogLike.belongsTo(User);

module.exports = BlogLike;
