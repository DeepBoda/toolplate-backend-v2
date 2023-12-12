"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.changeColumn("users", "profilePic", {
      type: Sequelize.TEXT,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "profilePic", {
      type: Sequelize.STRING,
    });
  },
};
