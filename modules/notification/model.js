"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Notification = sequelize.define("notification", {
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
  body: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  click_action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Notification;
