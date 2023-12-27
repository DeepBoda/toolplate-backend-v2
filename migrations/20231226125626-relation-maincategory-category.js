"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the association between MainCategory and Category
    await queryInterface.addColumn("categories", "mainCategoryId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "mainCategories",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the association column
    await queryInterface.removeColumn("categories", "mainCategoryId");
  },
};
