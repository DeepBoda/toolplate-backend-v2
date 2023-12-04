"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add a new column for the temporary integer rating
    await queryInterface.addColumn("toolRatings", "tempRating", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Step 2: Update the new column with rounded values from the existing float column
    await queryInterface.sequelize.query(`
    UPDATE toolRatings
    SET tempRating = CAST(rating AS SIGNED);
`);

    // Step 3: Remove the existing float column
    await queryInterface.removeColumn("toolRatings", "rating");

    // Step 4: Rename the temporary integer column to the original name
    await queryInterface.renameColumn("toolRatings", "tempRating", "rating");
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes in the down migration
    await queryInterface.renameColumn("toolRatings", "rating", "tempRating");
    await queryInterface.addColumn("toolRatings", "rating", {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
    await queryInterface.sequelize.query(`
      UPDATE "toolRatings"
      SET "rating" = "tempRating";
    `);
    await queryInterface.removeColumn("toolRatings", "tempRating");
  },
};
