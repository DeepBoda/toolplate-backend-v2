"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("submitTools", "logo", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("submitTools", "video", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("submitTools", "previews", {
      type: Sequelize.JSON,
      defaultValue: [],
    });
    await queryInterface.addColumn("submitTools", "overview", {
      type: Sequelize.TEXT("long"),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("submitTools", "logo");
    await queryInterface.removeColumn("submitTools", "video");
    await queryInterface.removeColumn("submitTools", "previews");
    await queryInterface.removeColumn("submitTools", "overview");
  },
};
