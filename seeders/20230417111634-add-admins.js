"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const admins = [];
    admins.push({
      id: 1,
      name: "Bash Admin",
      email: "admin@bash.com",
      password: "$2a$12$ncP5EI3Fx2CFCbnmHWGky.bgdQYEk/qoNWdpQIenTG78vgH8bhAZG",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (var i = 0; i < 20; i++) {
      admins.push({
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password:
          "$2a$12$ncP5EI3Fx2CFCbnmHWGky.bgdQYEk/qoNWdpQIenTG78vgH8bhAZG",
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

    await queryInterface.bulkInsert("Admins", admins, {
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
    await queryInterface.bulkDelete("Admins", null, {
      ignoreDuplicates: true,
    });
  },
};
