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
        const storedValue = this.getDataValue("faqs");
        return storedValue || [];
      },
      set: function (val) {
        // If data is a string, attempt to parse it as JSON
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (error) {
            console.error("Error parsing cons field:", error);
            data = [];
          }
        }

        this.setDataValue("faqs", data);
      },
    },
  },
  {
    paranoid: true,
  }
);

module.exports = MainCategory;
