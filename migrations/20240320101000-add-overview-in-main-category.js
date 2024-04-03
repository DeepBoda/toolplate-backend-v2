"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("mainCategories", "overview", {
      type: Sequelize.TEXT("long"),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("mainCategories", "overview");
  },
};
