"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const MainCategory = sequelize.define(
  "mainCategory",
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
    image: {
      type: DataTypes.STRING,
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
  },
  {
    paranoid: true,
  }
);

module.exports = MainCategory;
