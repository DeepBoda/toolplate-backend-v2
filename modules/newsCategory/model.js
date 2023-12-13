"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const NewsCategory = sequelize.define(
  "newsCategory",
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
    slug: {
      type: DataTypes.STRING,
    },
  },
  {
    paranoid: true,
  }
);
module.exports = NewsCategory;
