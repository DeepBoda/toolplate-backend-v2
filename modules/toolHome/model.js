"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = require("../tool/model");
const Admin = require("../admin/model");
const ToolHome = sequelize.define("toolHome", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

Tool.hasMany(ToolHome, {
  foreignKey: {
    allowNull: false,
  },
});
ToolHome.belongsTo(Tool);

// without login tool can be accessible so userId not required
Admin.hasMany(ToolHome);
ToolHome.belongsTo(Admin);

module.exports = ToolHome;
