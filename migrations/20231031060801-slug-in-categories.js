"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("categories", "slug", {
      type: Sequelize.STRING,
      defaultValue: "",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("categories", "slug");
  },
};
