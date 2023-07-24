"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Temp = sequelize.define("Temps", {
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
});

module.exports = Temp;
