"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = require("../tool/model");
const Tag = require("../tag/model");
const ToolTag = sequelize.define("toolTag", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
});

Tool.hasMany(ToolTag, {
  foreignKey: {
    allowNull: false,
  },
});
ToolTag.belongsTo(Tool);
Tag.hasMany(ToolTag, {
  foreignKey: {
    allowNull: false,
  },
});
ToolTag.belongsTo(Tag);

module.exports = ToolTag;
