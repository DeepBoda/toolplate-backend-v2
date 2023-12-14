"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const startDate = "2023-01-01T00:00:00.000Z";
    const endDate = "2024-01-01T00:00:00.000Z";

    // Define the image URLs based on the provided information
    const imageUrls = {
      Updates: "https://cdn.toolplate.ai/public/updates.png",
      Interesting: "https://cdn.toolplate.ai/public/interesting.png",
      Research: "https://cdn.toolplate.ai/public/research.png",
      Learn: "https://cdn.toolplate.ai/public/learn.png",
      Podcast: "https://cdn.toolplate.ai/public/podcast.png",
    };

    const newsCategories = [];

    // Loop through the newsCategories and create seed data
    for (const [name, imageUrl] of Object.entries(imageUrls)) {
      const slug = name.toLocaleLowerCase();
      const createdAt = faker.date.between(startDate, endDate);
      const updatedAt = faker.date.between(startDate, endDate);

      newsCategories.push({
        name,
        image: imageUrl,
        slug,
        createdAt,
        updatedAt,
      });
    }

    // Insert seed data into the 'newsCategories' table
    await queryInterface.bulkInsert("newsCategories", newsCategories, {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('categories', null, {});
     */
    await queryInterface.bulkDelete("newsCategories");
  },
};
