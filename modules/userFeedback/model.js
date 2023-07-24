"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../user/model");

const UserFeedback = sequelize.define("UserFeedback", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  feedback: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

User.hasMany(UserFeedback, {
  foreignKey: {
    allowNull: false,
  },
});
UserFeedback.belongsTo(User);
module.exports = UserFeedback;
