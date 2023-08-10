"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");
const tools = require("../modules/tool/service");
const users = require("../modules/user/service");
module.exports = {
  async up(queryInterface, Sequelize) {
    const toolRatings = [];
    const tool = await tools.findAll({
      attributes: ["id"],
    });
    const user = await users.findAll({
      attributes: ["id"],
    });
    const ratings = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

    for (var i = 0; i < 250; i++) {
      toolRatings.push({
        title: faker.random.words(5),
        review: faker.random.words(20),
        rating: faker.helpers.arrayElement(ratings),
        toolId: faker.helpers.arrayElement(tool.map((el) => el.id)),
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

    await queryInterface.bulkInsert("toolRatings", toolRatings, {
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
    await queryInterface.bulkDelete("toolRatings");
  },
};
