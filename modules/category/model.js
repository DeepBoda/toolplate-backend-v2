"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
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
  },
  {
    paranoid: true,
  }
);

module.exports = Category;
