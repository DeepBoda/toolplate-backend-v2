"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("newsCategories", "overview", {
      type: Sequelize.TEXT("long"),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("newsCategories", "overview");
  },
};
