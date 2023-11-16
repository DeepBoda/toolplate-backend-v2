"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tools", "social", {
      type: Sequelize.TEXT,
      get: function () {
        return this.getDataValue("social")
          ? JSON.parse(this.getDataValue("social"))
          : [];
      },
      set: function (val) {
        return this.setDataValue("social", JSON.stringify(val));
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tools", "social");
  },
};
