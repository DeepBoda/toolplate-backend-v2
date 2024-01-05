"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Rename the existing column categoryId to categoryOfBlogId
    await queryInterface.renameColumn(
      "blogCategories",
      "categoryId",
      "categoryOfBlogId"
    );

    // Step 2: Modify the model to use categoryOfBlogId
    await queryInterface.changeColumn("blogCategories", "categoryOfBlogId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "categoryOfBlogs", // Adjust model name if needed
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes in the down migration (if needed)
    await queryInterface.changeColumn("blogCategories", "categoryOfBlogId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Revert the changes in the down migration (if needed)
    await queryInterface.renameColumn(
      "blogCategories",
      "categoryOfBlogId",
      "categoryId"
    );
  },
};
