"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Listing = require("../listing/model");
const User = require("../user/model");
const ListingComment = sequelize.define("listingComment", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Listing.hasMany(ListingComment, {
  foreignKey: {
    allowNull: false,
  },
});
ListingComment.belongsTo(Listing);

User.hasMany(ListingComment, {
  foreignKey: {
    allowNull: false,
  },
});
ListingComment.belongsTo(User);

module.exports = ListingComment;
