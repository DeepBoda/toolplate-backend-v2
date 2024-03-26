"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../user/model");
const Tool = require("../tool/model");
const Pitch = sequelize.define(
  "pitch",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    toolName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Initial",
    },
    reason: {
      type: DataTypes.STRING,
    },
    isCompany: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    paranoid: true,
  }
);

User.hasMany(Pitch);
Pitch.belongsTo(User);

Tool.hasMany(Pitch, {
  foreignKey: {
    allowNull: true,
  },
});
Pitch.belongsTo(Tool);

module.exports = Pitch;
