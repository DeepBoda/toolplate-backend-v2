"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const startDate = "2020-01-01T00:00:00.000Z";
    const endDate = "2023-03-01T00:00:00.000Z";

    const categories = [];

    for (let i = 0; i < 100; i++) {
      const name = faker.random.word(); // Generate a random category name
      const createdAt = faker.date.between(startDate, endDate);
      const updatedAt = faker.date.between(startDate, endDate);

      categories.push({
        name,
        createdAt,
        updatedAt,
      });
    }

    await queryInterface.bulkInsert("categories", categories, {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("categories");
  },
};
