"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../user/model");
const Prompt = sequelize.define(
  "prompt",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    search: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    paranoid: true,
  }
);

// without login prompt searching can be accessible so userId not required
User.hasMany(Prompt);
Prompt.belongsTo(User);

module.exports = Prompt;
