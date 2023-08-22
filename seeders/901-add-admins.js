"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const admins = [];
    admins.push({
      name: "Anshu Joshi",
      email: "copywriter.tst@gmail.com",
      password: "$2a$12$TF3tOp2.nD6.IFL8FW6YQeEA6LTZpAa.i0lqJYl/2GqstDRY0YTS6",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
