"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [];

    for (var i = 0; i < 50; i++) {
      users.push({
        username: faker.name.firstName(),

        email: faker.internet.email(),
        password:
          "$2a$12$TF3tOp2.nD6.IFL8FW6YQeEA6LTZpAa.i0lqJYl/2GqstDRY0YTS6",

        uid: faker.datatype.uuid(),
        profilePic: faker.image.people(),

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

    await queryInterface.bulkInsert("users", users, {
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
    await queryInterface.bulkDelete("users", null, {
      ignoreDuplicates: true,
    });
  },
};
