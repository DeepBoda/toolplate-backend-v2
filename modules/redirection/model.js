"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Admin = require("../admin/model");
const { trimUrl } = require("../../utils/service");

const Redirection = sequelize.define(
  "redirection",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    old: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("old", trimUrl(value));
      },
    },
    new: {
      type: DataTypes.TEXT,
      allowNull: false,
      set(value) {
        this.setDataValue("new", trimUrl(value));
      },
    },
    isPermanent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    paranoid: true,
    indexes: [{ unique: true, fields: ["old"] }],
  }
);

Admin.hasMany(Redirection, { onDelete: "CASCADE" });
Redirection.belongsTo(Admin, { onDelete: "CASCADE" });

module.exports = Redirection;
