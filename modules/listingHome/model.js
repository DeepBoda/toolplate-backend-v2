"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Listing = require("../listing/model");
const Admin = require("../admin/model");
const ListingHome = sequelize.define("listingHome", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

Listing.hasMany(ListingHome, {
  foreignKey: {
    allowNull: false,
  },
});
ListingHome.belongsTo(Listing);

// without login Listing can be accessible so userId not required
Admin.hasMany(ListingHome);
ListingHome.belongsTo(Admin);

module.exports = ListingHome;
