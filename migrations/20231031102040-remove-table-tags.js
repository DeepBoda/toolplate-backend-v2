"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the 'blogTags' table
    await queryInterface.dropTable("blogTags");
    // Remove the 'toolTags' table
    await queryInterface.dropTable("toolTags");
    // Remove the 'tags' table
    await queryInterface.dropTable("tags");
  },

  down: async (queryInterface, Sequelize) => {
    // If you ever need to rollback, you can recreate the tables here.
    // You would typically create the tables with their appropriate columns.
  },
};
