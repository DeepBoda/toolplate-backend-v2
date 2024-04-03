"use strict";
const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../../config/db");
const Tool = sequelize.define(
  "tool",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    overview: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    videos: {
      type: DataTypes.TEXT,
      get: function () {
        const storedValue = this.getDataValue("videos");
        return storedValue || [];
      },
      set: function (data) {
        // If data is a string, attempt to parse it as JSON
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (error) {
            console.error("Error parsing videos field:", error);
            data = [];
          }
        }
        // Ensure data is an array
        if (!Array.isArray(data)) {
          data = [data];
        }
        return this.setDataValue("videos", data);
      },
    },

    slug: {
      type: DataTypes.STRING,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    wishlists: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    ratingsAverage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalRatings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    release: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    social: {
      type: DataTypes.JSON,
      get: function () {
        const storedValue = this.getDataValue("social");
        return storedValue || [];
      },
      set: function (val) {
        if (typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch (error) {
            console.error("Error parsing social field:", error);
            val = [];
          }
        }
        this.setDataValue("social", val);
      },
    },

    isExtension: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isApi: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    pros: {
      type: DataTypes.JSON,
      defaultValue: [],
      get: function () {
        const storedValue = this.getDataValue("pros");
        return storedValue || [];
      },
      set: function (data) {
        // If data is a string, attempt to parse it as JSON
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (error) {
            console.error("Error parsing pros field:", error);
            data = [];
          }
        }
        // Ensure data is an array
        if (!Array.isArray(data)) {
          data = [data];
        }
        return this.setDataValue("pros", data);
      },
    },
    cons: {
      type: DataTypes.JSON,
      defaultValue: [],
      get: function () {
        const storedValue = this.getDataValue("cons");
        return storedValue || [];
      },
      set: function (data) {
        // If data is a string, attempt to parse it as JSON
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (error) {
            console.error("Error parsing cons field:", error);
            data = [];
          }
        }
        // Ensure data is an array
        if (!Array.isArray(data)) {
          data = [data];
        }
        return this.setDataValue("cons", data);
      },
    },
  },
  {
    paranoid: true,
  }
);
module.exports = Tool;
