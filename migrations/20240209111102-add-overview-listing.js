"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the new column
    await queryInterface.addColumn("listings", "overview", {
      type: Sequelize.TEXT("long"),
    });

    // Copy data from description to overview
    await queryInterface.sequelize.query(
      `UPDATE listings SET overview = description;`
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the new column
    await queryInterface.removeColumn("listings", "overview");
  },
};
