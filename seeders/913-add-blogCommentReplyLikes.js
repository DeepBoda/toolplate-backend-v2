"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");
const blogCommentReplys = require("../modules/blogCommentReply/service");
const users = require("../modules/user/service");
module.exports = {
  async up(queryInterface, Sequelize) {
    const blogCommentReplyLikes = [];
    const blogCommentReply = await blogCommentReplys.findAll({
      attributes: ["id"],
    });
    const user = await users.findAll({
      attributes: ["id"],
    });

    for (var i = 0; i < 1000; i++) {
      blogCommentReplyLikes.push({
        blogCommentReplyId: faker.helpers.arrayElement(
          blogCommentReply.map((el) => el.id)
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

    await queryInterface.bulkInsert(
      "blogCommentReplyLikes",
      blogCommentReplyLikes,
      {
        ignoreDuplicates: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("blogCommentReplyLikes");
  },
};
