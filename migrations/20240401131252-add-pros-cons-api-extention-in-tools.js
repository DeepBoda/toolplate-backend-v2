"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tools", "isExtension", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn("tools", "isApi", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn("tools", "pros", {
      type: Sequelize.JSON,
      defaultValue: [], // No default value for JSON fields
    });
    await queryInterface.addColumn("tools", "cons", {
      type: Sequelize.JSON,
      defaultValue: [], // No default value for JSON fields
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tools", "isExtension");
    await queryInterface.removeColumn("tools", "isApi");
    await queryInterface.removeColumn("tools", "pros");
    await queryInterface.removeColumn("tools", "cons");
  },
};
