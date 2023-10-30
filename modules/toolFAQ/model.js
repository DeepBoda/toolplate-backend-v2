"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = require("../tool/model");
const ToolFAQ = sequelize.define("toolFAQ", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  faqs: {
    type: DataTypes.JSON,
  },
});

Tool.hasOne(ToolFAQ, {
  foreignKey: {
    allowNull: false,
  },
});
ToolFAQ.belongsTo(Tool);

// ToolFAQ.sync({ alter: true });
module.exports = ToolFAQ;
