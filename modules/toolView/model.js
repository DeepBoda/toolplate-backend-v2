"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = require("../tool/model");
const User = require("../user/model");
const ToolView = sequelize.define("toolView", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
});

Tool.hasMany(ToolView, {
  foreignKey: {
    allowNull: false,
  },
});
ToolView.belongsTo(Tool);

// without login tool can be accessible so userId not required
User.hasMany(ToolView);
ToolView.belongsTo(User);

module.exports = ToolView;
