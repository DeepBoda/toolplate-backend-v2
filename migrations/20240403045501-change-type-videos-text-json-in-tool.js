"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.changeColumn("tools", "videos", {
      type: Sequelize.JSON,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("tools", "videos", {
      type: Sequelize.JSON,
    });
  },
};
