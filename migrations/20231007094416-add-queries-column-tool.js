"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tools", "likes", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn("tools", "views", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn("tools", "wishlists", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn("tools", "ratingsAverage", {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    });
    await queryInterface.addColumn("tools", "totalRatings", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tools", "likes");
    await queryInterface.removeColumn("tools", "views");
    await queryInterface.removeColumn("tools", "wishlists");
    await queryInterface.removeColumn("tools", "ratingsAverage");
    await queryInterface.removeColumn("tools", "totalRatings");
  },
};
