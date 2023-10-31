"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tags", "slug", {
      type: Sequelize.STRING,
      defaultValue: "",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tags", "slug");
  },
};
