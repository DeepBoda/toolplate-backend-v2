"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");
const blogs = require("../modules/blog/service");
const categories = require("../modules/category/service");
module.exports = {
  async up(queryInterface, Sequelize) {
    const blogCategories = [];
    const blog = await blogs.findAll({
      attributes: ["id"],
    });
    const category = await categories.findAll({
      attributes: ["id"],
    });

    for (var i = 0; i < 10; i++) {
      blogCategories.push({
        blogId: faker.helpers.arrayElement(blog.map((el) => el.id)),
        categoryId: faker.helpers.arrayElement(category.map((el) => el.id)),
        createdAt: faker.date.between(
          "2020-01-01T00:00:00.000Z",
          "2023-03-01T00:00:00.000Z"
        ),
        updatedAt: faker.date.between(
          "2020-01-01T00:00:00.000Z",
          "2023-03-01T00:00:00.000Z"
        ),
      });
    }

    await queryInterface.bulkInsert("blogCategories", blogCategories, {
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
    await queryInterface.bulkDelete("blogCategories");
  },
};
