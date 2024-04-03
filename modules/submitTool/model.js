"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../user/model");
const Tool = require("../tool/model");
const SubmitTool = sequelize.define(
  "submitTool",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Pending",
    },
    reason: {
      type: DataTypes.STRING,
    },
  },
  {
    paranoid: true,
  }
);

User.hasMany(SubmitTool);
SubmitTool.belongsTo(User);

Tool.hasMany(SubmitTool, {
  foreignKey: {
    allowNull: true,
  },
});
SubmitTool.belongsTo(Tool);

module.exports = SubmitTool;
