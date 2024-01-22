"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const CategoryOfListing = sequelize.define(
  "categoryOfListing",
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
    slug: {
      type: DataTypes.STRING,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = CategoryOfListing;
