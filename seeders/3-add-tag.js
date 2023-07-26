"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const tags = [
      {
        name: "AI",
      },
      {
        name: "3D",
      },
      {
        name: "Technology",
      },
    ];

    await queryInterface.bulkInsert("tags", tags, {
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
    await queryInterface.bulkDelete("tags");
  },
};
