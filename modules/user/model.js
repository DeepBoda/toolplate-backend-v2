"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },

    email: {
      type: DataTypes.STRING,
    },
    mobile: {
      type: DataTypes.BIGINT,
    },
    dob: {
      type: DataTypes.DATE,
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
      mobile: {
        fields: ["mobile", "deletedAt"],
      },
    },
    hooks: {
      // beforeCreate: async (User, options) => {
      //   console.log("before save/create User");
      //   User.password = await bcryptjs.hash(User.password, 12);
      // },
      // beforeUpdate: async (User, options) => {
      //   console.log("Before update User");
      //   User.password = await bcryptjs.hash(User.password, 12);
      // },
    },
  }
);

module.exports = User;
