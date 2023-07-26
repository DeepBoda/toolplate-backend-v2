"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Blog = require("../blog/model");
const Tag = require("../tag/model");
const BlogTag = sequelize.define(
  "blogTag",
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
      blogId_tagId: {
        fields: ["blogId", "tagId"],
      },
    },
  }
);

Blog.hasMany(BlogTag, {
  foreignKey: {
    allowNull: false,
  },
});
BlogTag.belongsTo(Blog);
Tag.hasMany(BlogTag, {
  foreignKey: {
    allowNull: false,
  },
});
BlogTag.belongsTo(Tag);

module.exports = BlogTag;
