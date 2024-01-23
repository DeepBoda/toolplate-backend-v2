"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Listing = require("../listing/model");
const User = require("../user/model");
const ListingLike = sequelize.define(
  "listingLike",
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

Listing.hasMany(ListingLike, {
  foreignKey: {
    allowNull: false,
  },
});
ListingLike.belongsTo(Listing);

// without login listing can be accessible so userId not required
User.hasMany(ListingLike, {
  foreignKey: {
    allowNull: false,
  },
});
ListingLike.belongsTo(User);

module.exports = ListingLike;
