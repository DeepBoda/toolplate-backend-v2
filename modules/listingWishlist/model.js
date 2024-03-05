"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Listing = require("../listing/model");
const User = require("../user/model");
const listingWishlist = sequelize.define(
  "listingWishlist",
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
      listingId_userId: {
        fields: ["listingId", "userId"],
      },
    },
  }
);

Listing.hasMany(listingWishlist, {
  foreignKey: {
    allowNull: false,
  },
});
listingWishlist.belongsTo(Listing);

// without login listing can be accessible so userId not required
User.hasMany(listingWishlist);
listingWishlist.belongsTo(User);

module.exports = listingWishlist;
