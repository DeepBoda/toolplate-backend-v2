"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = require("../tool/model");
const ToolSeo = sequelize.define("toolSeo", {
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

Tool.hasOne(ToolSeo, {
  foreignKey: {
    allowNull: false,
    unique: true,
  },
});
ToolSeo.belongsTo(Tool);

module.exports = ToolSeo;
