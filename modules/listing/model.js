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
    },
    metaDescription: {
      type: DataTypes.TEXT,
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeValidate: (listing, options) => {
        if (!listing.metaTitle) {
          listing.metaTitle = listing.title;
        }
        if (!listing.metaDescription) {
          listing.metaDescription = listing.description;
        }
      },
    },
  }
);

module.exports = Listing;
