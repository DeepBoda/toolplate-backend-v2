"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const bcryptjs = require("bcryptjs");

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      isEmail: true,
    },
    password: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    uid: {
      type: DataTypes.STRING,
    },
    profilePic: {
      type: DataTypes.STRING,
    },
    FCM: {
      type: DataTypes.STRING,
    },
    deletedAt: {
      type: DataTypes.DATE,
      defaultValue: new Date(0),
    },
  },
  {
    paranoid: true,
    uniqueKeys: {
      email: {
        fields: ["email", "deletedAt"],
      },
      // mobile: {
      //   fields: ["mobile", "deletedAt"],
      // },
    },
    hooks: {
      beforeCreate: async (user, options) => {
        console.log("before save/create User");
        if (user.password)
          user.password = await bcryptjs.hash(user.password, 12);
      },
      beforeUpdate: async (user, options) => {
        console.log("Before update User");
        if (user.password)
          user.password = await bcryptjs.hash(user.password, 12);
      },
    },
  }
);

module.exports = User;
