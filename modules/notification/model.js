"use strict";
const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../../config/db");
const Admin = require("../admin/model");

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
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  schedule: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});

Admin.hasMany(Notification, {
  foreignKey: {
    allowNull: false,
  },
});
Notification.belongsTo(Admin);

// Notification.sync({ alter: true });

module.exports = Notification;
