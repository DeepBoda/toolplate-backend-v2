"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Blog = require("../blog/model");
const User = require("../user/model");
const Wishlist = sequelize.define("wishlist", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
});

Blog.hasMany(Wishlist, {
  foreignKey: {
    allowNull: false,
  },
});
Wishlist.belongsTo(Blog);

// without login blog can be accessible so userId not required
User.hasMany(Wishlist);
Wishlist.belongsTo(User);

module.exports = Wishlist;
