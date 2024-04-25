"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../user/model");
const Tool = require("../tool/model");
const SubmitTool = sequelize.define(
  "submitTool",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    logo: {
      type: DataTypes.STRING,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    video: {
      type: DataTypes.STRING,
    },
    previews: {
      type: DataTypes.JSON,
      get: function () {
        const storedValue = this.getDataValue("previews");
        return storedValue || [];
      },
      set: function (data) {
        // If data is a string, attempt to parse it as JSON
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (error) {
            console.error("Error parsing previews field:", error);
            data = [];
          }
        }
        // Ensure data is an array
        if (!Array.isArray(data)) {
          data = [data];
        }
        return this.setDataValue("previews", data);
      },
    },
    overview: {
      type: DataTypes.TEXT("long"),
    },
    message: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Pending",
    },
    reason: {
      type: DataTypes.STRING,
    },
  },
  {
    paranoid: true,
  }
);

User.hasMany(SubmitTool);
SubmitTool.belongsTo(User);

Tool.hasMany(SubmitTool, {
  foreignKey: {
    allowNull: true,
  },
});
SubmitTool.belongsTo(Tool);

module.exports = SubmitTool;
