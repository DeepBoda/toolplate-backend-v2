"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Blog = require("../blog/model");
const User = require("../user/model");
const blogWishlist = sequelize.define(
  "blogWishlist",
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

Blog.hasMany(blogWishlist, {
  foreignKey: {
    allowNull: false,
  },
});
blogWishlist.belongsTo(Blog);

// without login blog can be accessible so userId not required
User.hasMany(blogWishlist);
blogWishlist.belongsTo(User);

module.exports = blogWishlist;
