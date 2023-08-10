"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");
const tools = require("../modules/tool/service");
const categories = require("../modules/category/service");
module.exports = {
  async up(queryInterface, Sequelize) {
    const toolCategories = [];
    const tool = await tools.findAll({
      attributes: ["id"],
    });
    const category = await categories.findAll({
      attributes: ["id"],
    });

    for (var i = 0; i < 50; i++) {
      toolCategories.push({
        toolId: faker.helpers.arrayElement(tool.map((el) => el.id)),
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

    await queryInterface.bulkInsert("toolCategories", toolCategories, {
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
    await queryInterface.bulkDelete("toolCategories");
  },
};
