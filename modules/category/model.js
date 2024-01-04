"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const MainCategory = require("../mainCategory/model");
const Category = sequelize.define(
  "category",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    overview: {
      type: DataTypes.TEXT("long"),
    },
    slug: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING,
    },
  },
  {
    paranoid: true,
  }
);

MainCategory.hasMany(Category);
Category.belongsTo(MainCategory);

module.exports = Category;
