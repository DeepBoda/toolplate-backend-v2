"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");
const blogs = require("../modules/blog/service");
const tags = require("../modules/tag/service");
module.exports = {
  async up(queryInterface, Sequelize) {
    const blogTags = [];
    const blog = await blogs.findAll({
      attributes: ["id"],
    });
    const tag = await tags.findAll({
      attributes: ["id"],
    });

    for (var i = 0; i < 200; i++) {
      blogTags.push({
        blogId: faker.helpers.arrayElement(blog.map((el) => el.id)),
        tagId: faker.helpers.arrayElement(tag.map((el) => el.id)),
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

    await queryInterface.bulkInsert("blogTags", blogTags, {
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
    await queryInterface.bulkDelete("blogTags");
  },
};
