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
// ToolImage.sync({ alter: true });
module.exports = ToolImage;
