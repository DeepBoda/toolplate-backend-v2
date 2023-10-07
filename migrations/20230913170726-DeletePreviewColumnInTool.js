"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tools", "previews");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("tools", "previews", {
      type: Sequelize.TEXT,
      get: function () {
        return this.getDataValue("previews")
          ? JSON.parse(this.getDataValue("previews"))
          : [];
      },
      set: function (data) {
        return this.setDataValue("previews", JSON.stringify(data));
      },
    });
  },
};
