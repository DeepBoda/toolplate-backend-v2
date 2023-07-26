"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");
const blogs = require("../modules/blog/service");
module.exports = {
  async up(queryInterface, Sequelize) {
    const blogViews = [];
    const blog = await blogs.findAll({
      attributes: ["id"],
    });

    for (var i = 0; i < 250; i++) {
      blogViews.push({
        blogId: faker.helpers.arrayElement(blog.map((el) => el.id)),
        userId: 1,
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

    await queryInterface.bulkInsert("blogViews", blogViews, {
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
    await queryInterface.bulkDelete("blogViews");
  },
};
