"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("newsCategories", "title", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("newsCategories", "description", {
      type: Sequelize.TEXT,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("newsCategories", "title");
    await queryInterface.removeColumn("newsCategories", "description");
  },
};
