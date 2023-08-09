"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = require("../tool/model");
const User = require("../user/model");
const ToolLike = sequelize.define(
  "toolLike",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  {
    uniqueKeys: {
      toolId_userId: {
        fields: ["toolId", "userId"],
      },
    },
  }
);

Tool.hasMany(ToolLike, {
  foreignKey: {
    allowNull: false,
  },
});
ToolLike.belongsTo(Tool);

// without login Tool can be accessible so userId not required
User.hasMany(ToolLike, {
  foreignKey: {
    allowNull: false,
  },
});
ToolLike.belongsTo(User);

module.exports = ToolLike;
