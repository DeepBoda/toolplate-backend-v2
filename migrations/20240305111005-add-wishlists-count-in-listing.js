module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("listings", "wishlists", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("listings", "wishlists");
  },
};
