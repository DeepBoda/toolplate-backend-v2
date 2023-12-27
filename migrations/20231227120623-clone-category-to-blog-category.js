"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Copy data from categories to categoryOfBlog
    await queryInterface.sequelize.query(`
      INSERT INTO categoryOfBlogs (name, description, slug, createdAt, updatedAt, deletedAt)
      SELECT name, description, slug, createdAt, updatedAt, deletedAt
      FROM categories;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove data from categoryOfBlog
    await queryInterface.bulkDelete("categoryOfBlogs", null, {});
  },
};
