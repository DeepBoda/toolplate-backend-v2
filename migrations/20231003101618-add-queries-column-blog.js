"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("blogs", "likes", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn("blogs", "views", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn("blogs", "comments", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn("blogs", "wishlists", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("blogs", "likes");
    await queryInterface.removeColumn("blogs", "views");
    await queryInterface.removeColumn("blogs", "comments");
    await queryInterface.removeColumn("blogs", "wishlists");
  },
};
