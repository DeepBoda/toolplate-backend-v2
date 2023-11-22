"use strict";
const { DataTypes } = require("sequelize");
const bcryptjs = require("bcryptjs");
const sequelize = require("../../config/db");

const Admin = sequelize.define(
  "Admin",
  {
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
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
    },
    hooks: {
      beforeCreate: async (admin, options) => {
        console.log("before save/create admin");
        admin.password = await bcryptjs.hash(admin.password, 12);
      },
      beforeUpdate: async (admin, options) => {
        console.log("Before update admin");
        if (admin.password)
          admin.password = await bcryptjs.hash(admin.password, 12);
      },
    },
  }
);
// Admin.sync({ alter: true });

module.exports = Admin;
