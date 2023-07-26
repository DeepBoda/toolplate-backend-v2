"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const categories = [
      {
        name: "CopyWriting",
      },
      {
        name: "Image",
      },
      {
        name: "Video",
      },
      {
        name: "Audio",
      },
    ];

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
