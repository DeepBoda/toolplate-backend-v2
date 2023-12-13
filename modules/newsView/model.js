"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../user/model");
const News = require("../news/model");
const NewsView = sequelize.define("newsView", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
});

News.hasMany(NewsView, {
  foreignKey: {
    allowNull: false,
  },
});
NewsView.belongsTo(News);

// without login News can be accessible so userId not required
User.hasMany(NewsView);
NewsView.belongsTo(User);

module.exports = NewsView;
