"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const ListingComment = require("../listingComment/model");
const User = require("../user/model");
const ListingCommentReply = sequelize.define("listingCommentReply", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

ListingComment.hasMany(ListingCommentReply, {
  foreignKey: {
    allowNull: false,
  },
});
ListingCommentReply.belongsTo(ListingComment);

// without login listing can be accessible so userId not required
User.hasMany(ListingCommentReply, {
  foreignKey: {
    allowNull: false,
  },
});
ListingCommentReply.belongsTo(User);

module.exports = ListingCommentReply;
