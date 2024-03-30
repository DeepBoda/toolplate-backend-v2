"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("mainCategories", "bottomOverview", {
      type: Sequelize.TEXT("long"),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("mainCategories", "bottomOverview");
  },
};
