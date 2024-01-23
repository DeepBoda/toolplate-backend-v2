"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Listing = require("../listing/model");
const User = require("../user/model");
const ListingView = sequelize.define("listingView", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
});

Listing.hasMany(ListingView, {
  foreignKey: {
    allowNull: false,
  },
});
ListingView.belongsTo(Listing);

// without login Listing can be accessible so userId not required
User.hasMany(ListingView);
ListingView.belongsTo(User);

module.exports = ListingView;
