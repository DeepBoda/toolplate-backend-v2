"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = require("../tool/model");
const Category = require("../category/model");
const ToolCategory = sequelize.define("toolCategory", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
});

Tool.hasMany(ToolCategory, {
  foreignKey: {
    allowNull: false,
  },
});
ToolCategory.belongsTo(Tool);
Category.hasMany(ToolCategory, {
  foreignKey: {
    allowNull: false,
  },
});
ToolCategory.belongsTo(Category);

module.exports = ToolCategory;
