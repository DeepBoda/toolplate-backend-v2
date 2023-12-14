"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = require("../tool/model");
const News = require("../news/model");
const ToolNews = sequelize.define("toolNews", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
});

Tool.hasMany(ToolNews, {
  foreignKey: {
    allowNull: false,
  },
});
ToolNews.belongsTo(Tool);

News.hasMany(ToolNews, {
  foreignKey: {
    allowNull: false,
  },
});
ToolNews.belongsTo(News);

module.exports = ToolNews;
