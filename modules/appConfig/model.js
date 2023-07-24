"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const AppConfig = sequelize.define("appConfig", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  appInMaintenance: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  androidVersionCode: {
    type: DataTypes.STRING,
    defaultValue: "1.0.0",
  },
  iosVersionCode: {
    type: DataTypes.STRING,
    defaultValue: "1.0.0",
  },
  forceUpdate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  softUpdate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = AppConfig;
