"use strict";
const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../../config/db");
const Listing = sequelize.define(
  "listing",
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
    alt: {
      type: DataTypes.STRING,
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
    comments: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metaTitle: {
      type: DataTypes.STRING,
      defaultValue: function () {
        return this.getDataValue("title");
      },
    },
    metaDescription: {
      type: DataTypes.TEXT,
      defaultValue: function () {
        return this.getDataValue("description");
      },
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Listing;
