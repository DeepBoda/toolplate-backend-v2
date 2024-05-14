"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const MainCategory = sequelize.define(
  "mainCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    overview: {
      type: DataTypes.TEXT("long"),
    },
    bottomOverview: {
      type: DataTypes.TEXT("long"),
    },
    slug: {
      type: DataTypes.STRING,
    },
    metaTitle: {
      type: DataTypes.STRING,
    },
    metaDescription: {
      type: DataTypes.TEXT("long"),
    },
    faqs: {
      type: DataTypes.TEXT,
      get: function () {
        return this.getDataValue("faqs")
          ? JSON.parse(this.getDataValue("faqs"))
          : [];
      },
      set: function (val) {
        return this.setDataValue("faqs", JSON.stringify(val));
      },
    },
  },
  {
    paranoid: true,
  }
);

module.exports = MainCategory;
