"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = require("../tool/model");
const ToolImage = sequelize.define(
  "toolImage",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING,
    },
    alt: {
      type: DataTypes.STRING,
    },
  },
  {
    paranoid: true,
  }
);
Tool.hasMany(ToolImage, {
  foreignKey: {
    allowNull: false,
  },
});
ToolImage.belongsTo(Tool);

module.exports = ToolImage;
