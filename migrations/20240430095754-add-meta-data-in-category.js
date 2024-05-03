"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("categories", "metaTitle", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("categories", "metaDescription", {
      type: Sequelize.TEXT("long"),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("categories", "metaTitle");
    await queryInterface.removeColumn("categories", "metaDescription");
  },
};
