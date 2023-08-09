"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = require("../tool/model");
const User = require("../user/model");
const ToolWishlist = sequelize.define(
  "toolWishlist",
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

Tool.hasMany(ToolWishlist, {
  foreignKey: {
    allowNull: false,
  },
});
ToolWishlist.belongsTo(Tool);

// without login Tool can be accessible so userId not required
User.hasMany(ToolWishlist);
ToolWishlist.belongsTo(User);

module.exports = ToolWishlist;
