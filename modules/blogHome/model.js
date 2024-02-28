"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Blog = require("../blog/model");
const Admin = require("../admin/model");
const BlogHome = sequelize.define("blogHome", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

Blog.hasMany(BlogHome, {
  foreignKey: {
    allowNull: false,
  },
});
BlogHome.belongsTo(Blog);

// without login Blog can be accessible so userId not required
Admin.hasMany(BlogHome);
BlogHome.belongsTo(Admin);

module.exports = BlogHome;
