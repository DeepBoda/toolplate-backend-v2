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
    type: DataTypes.TEXT,
    get: function () {
      return this.getDataValue("faqs")
        ? JSON.parse(this.getDataValue("faqs"))
        : [];
    },
    set: function (val) {
      return this.setDataValue("faqs", JSON.stringify(val));
    },
  },
});

Tool.hasOne(ToolFAQ, {
  foreignKey: {
    allowNull: false,
    unique: true,
  },
});
ToolFAQ.belongsTo(Tool);

module.exports = ToolFAQ;
