"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Blog = sequelize.define(
  "blog",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    alt: {
      type: DataTypes.STRING,
    },
    readTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    overview: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
    },
  },
  {
    paranoid: true,
  }
);

// Blog.sync({ alter: true });

module.exports = Blog;
