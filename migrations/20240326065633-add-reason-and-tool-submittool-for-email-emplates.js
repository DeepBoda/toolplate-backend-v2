"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("submitTools", "reason", {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    // Create the association between SubmitTool and Tool
    await queryInterface.addColumn("submitTools", "toolId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "tools",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("submitTools", "reason");
    await queryInterface.removeColumn("submitTools", "toolId");
  },
};
