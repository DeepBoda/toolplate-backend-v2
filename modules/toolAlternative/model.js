"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = require("../tool/model");
const ToolAlternative = sequelize.define("toolAlternative", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  topOverview: {
    type: DataTypes.TEXT("long"),
  },
  bottomOverview: {
    type: DataTypes.TEXT("long"),
  },
});

Tool.hasOne(ToolAlternative, {
  foreignKey: {
    allowNull: false,
    unique: true,
  },
});
ToolAlternative.belongsTo(Tool);

module.exports = ToolAlternative;
