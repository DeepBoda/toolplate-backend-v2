"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../user/model");
const ListingComment = require("../listingComment/model");
const ListingCommentLike = sequelize.define(
  "listingCommentLike",
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
      listingCommentId_userId: {
        fields: ["listingCommentId", "userId"],
      },
    },
  }
);

ListingComment.hasMany(ListingCommentLike, {
  foreignKey: {
    allowNull: false,
  },
});
ListingCommentLike.belongsTo(ListingComment);

// without login listing can be accessible so userId not required
User.hasMany(ListingCommentLike, {
  foreignKey: {
    allowNull: false,
  },
});
ListingCommentLike.belongsTo(User);

module.exports = ListingCommentLike;
