"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tag = sequelize.define(
  "tag",
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
    slug: {
      type: DataTypes.STRING,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Tag;
