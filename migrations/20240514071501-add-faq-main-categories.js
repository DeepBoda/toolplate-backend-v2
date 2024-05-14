"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("mainCategories", "faqs", {
      type: Sequelize.JSON,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("mainCategories", "faqs");
  },
};
