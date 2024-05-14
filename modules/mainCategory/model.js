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
      type: DataTypes.JSON,
      defaultValue: [],
      get: function () {
        const storedValue = this.getDataValue("faqs");
        return storedValue || [];
      },
      set: function (val) {
        if (typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch (error) {
            console.error("Error parsing faqs field:", error);
            val = [];
          }
        }
        // Ensure data is an array
        if (!Array.isArray(data)) {
          data = [data];
        }
        return this.setDataValue("faqs", data);
      },
    },
  },
  {
    paranoid: true,
  }
);

module.exports = MainCategory;
