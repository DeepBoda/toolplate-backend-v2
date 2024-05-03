"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("mainCategories", "metaTitle", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("mainCategories", "metaDescription", {
      type: Sequelize.TEXT("long"),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("mainCategories", "metaTitle");
    await queryInterface.removeColumn("mainCategories", "metaDescription");
  },
};
