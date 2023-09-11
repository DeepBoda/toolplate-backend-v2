"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = require("../tool/model");
const User = require("../user/model");
const ToolRating = sequelize.define(
  "toolRating",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
    },
    review: {
      type: DataTypes.TEXT,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    paranoid: true,
  }
);

Tool.hasMany(ToolRating, {
  foreignKey: {
    allowNull: false,
  },
});
ToolRating.belongsTo(Tool);

// without login Tool can be accessible so userId not required
User.hasMany(ToolRating, {
  foreignKey: {
    allowNull: false,
  },
});
ToolRating.belongsTo(User);

module.exports = ToolRating;
