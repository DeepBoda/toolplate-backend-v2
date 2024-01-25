"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Listing = require("../listing/model");
const Tool = require("../tool/model");
const ListingTool = sequelize.define("listingTool", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  index: {
    type: DataTypes.STRING,
    defaultValue: 0,
  },
});

Listing.hasMany(ListingTool, {
  foreignKey: {
    allowNull: false,
  },
});
ListingTool.belongsTo(Listing);

Tool.hasMany(ListingTool, {
  foreignKey: {
    allowNull: false,
  },
});
ListingTool.belongsTo(Tool);

module.exports = ListingTool;
