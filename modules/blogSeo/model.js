"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Blog = require("../blog/model");
const BlogSeo = sequelize.define("blogSeo", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  faqs: {
    type: DataTypes.TEXT,
    get: function () {
      return this.getDataValue("faqs")
        ? JSON.parse(this.getDataValue("faqs"))
        : [];
    },
    set: function (val) {
      return this.setDataValue("faqs", JSON.stringify(val));
    },
  },
});

Blog.hasOne(BlogSeo, {
  foreignKey: {
    allowNull: false,
    unique: true,
  },
});
BlogSeo.belongsTo(Blog);

module.exports = BlogSeo;
