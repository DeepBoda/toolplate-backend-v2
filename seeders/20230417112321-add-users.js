"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [];
    let referredCode = "12345";

    for (var i = 0; i < 200; i++) {
      users.push({
        name: faker.name.firstName(),

        email: faker.internet.email(),
        mobile: faker.datatype.bigInt({
          max: 1000000000,
          max: 9999999999,
        }),
        dob: faker.date.birthdate(),
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
