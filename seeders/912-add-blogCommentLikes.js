"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");
const blogComments = require("../modules/blogComment/service");
const users = require("../modules/user/service");
module.exports = {
  async up(queryInterface, Sequelize) {
    const blogCommentLikes = [];
    const blogComment = await blogComments.findAll({
      attributes: ["id"],
    });
    const user = await users.findAll({
      attributes: ["id"],
    });

    for (var i = 0; i < 1000; i++) {
      blogCommentLikes.push({
        blogCommentId: faker.helpers.arrayElement(
          blogComment.map((el) => el.id)
        ),
        userId: faker.helpers.arrayElement(user.map((el) => el.id)),
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

    await queryInterface.bulkInsert("blogCommentLikes", blogCommentLikes, {
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
    await queryInterface.bulkDelete("blogCommentLikes");
  },
};
