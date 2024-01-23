"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Listing = require("../listing/model");
const CategoryOfListing = require("../categoryOfListing/model");
const ListingCategory = sequelize.define("listingCategory", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
});

Listing.hasMany(ListingCategory, {
  foreignKey: {
    allowNull: false,
  },
});
ListingCategory.belongsTo(Listing);

CategoryOfListing.hasMany(ListingCategory, {
  foreignKey: {
    allowNull: false,
  },
});
ListingCategory.belongsTo(CategoryOfListing);

module.exports = ListingCategory;
