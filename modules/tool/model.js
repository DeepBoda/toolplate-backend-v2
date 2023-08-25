"use strict";
const { DataTypes } = require("sequelize");
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
    previews: {
      type: DataTypes.TEXT,
      get: function () {
        return this.getDataValue("previews")
          ? JSON.parse(this.getDataValue("previews"))
          : [];
      },
      set: function (data) {
        return this.setDataValue("previews", JSON.stringify(data));
      },
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
        return this.getDataValue("videos")
          ? JSON.parse(this.getDataValue("videos"))
          : [];
      },
      set: function (data) {
        return this.setDataValue("videos", JSON.stringify(data));
      },
    },
    slug: {
      type: DataTypes.STRING,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Tool;
