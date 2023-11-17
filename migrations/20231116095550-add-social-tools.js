"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tools", "social", {
      type: Sequelize.JSON,
      get: function () {
        const storedValue = this.getDataValue("social");
        return storedValue || [];
      },
      set: function (val) {
        if (typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch (error) {
            console.error("Error parsing social field:", error);
            val = [];
          }
        }
        this.setDataValue("social", val);
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tools", "social");
  },
};
