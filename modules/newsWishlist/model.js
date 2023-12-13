"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../user/model");
const News = require("../news/model");
const NewsWishlist = sequelize.define(
  "newsWishlist",
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
        fields: ["newsId", "userId"],
      },
    },
  }
);

News.hasMany(NewsWishlist, {
  foreignKey: {
    allowNull: false,
  },
});
NewsWishlist.belongsTo(News);

// without login Tool can be accessible so userId not required
User.hasMany(NewsWishlist);
NewsWishlist.belongsTo(User);

module.exports = NewsWishlist;
