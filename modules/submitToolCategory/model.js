"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Category = require("../category/model");
const SubmitTool = require("../submitTool/model");
const SubmitToolCategory = sequelize.define("submitToolCategory", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
});

SubmitTool.hasMany(SubmitToolCategory, {
  foreignKey: {
    allowNull: false,
  },
});
SubmitToolCategory.belongsTo(SubmitTool);
Category.hasMany(SubmitToolCategory, {
  foreignKey: {
    allowNull: false,
  },
});
SubmitToolCategory.belongsTo(Category);

module.exports = SubmitToolCategory;
