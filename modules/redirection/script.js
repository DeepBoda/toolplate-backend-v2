"use strict";

const sequelize = require("../../config/db");
const service = require("./service");
const categoryService = require("../category/service");
const toolService = require("../tool/service");

const DataEntryRedirect = async () => {
  try {
    const categories = await categoryService.findAll({
      distinct: true,
    });
    let RedirectEntries = [];

    for (let category of categories) {
      // Define the mappings for old and new URL structures based on pricing types
      const pricingTypes = ["free", "premium", "freemium"];
      for (let pricingType of pricingTypes) {
        let oldUrl = `/tools/${category.slug}/${pricingType}`;
        let newPricingValue = pricingType === "premium" ? "paid" : pricingType; // Map 'premium' to 'paid'
        let newUrl = `/tools/${category.slug}?pricing=${newPricingValue}`;

        // Push the payload for each pricing type into the RedirectEntries array
        RedirectEntries.push({
          old: oldUrl,
          new: newUrl,
          isPermanent: true,
          AdminId: 2,
        });
      }
    }

    // Bulk create Redirect entries
    if (RedirectEntries.length > 0) {
      await service.bulkCreate(RedirectEntries);
      console.log(
        `New Redirect entries created for ${
          RedirectEntries.length / 3
        } categories.`
      );
    }
  } catch (error) {
    console.error(error);
  }
};
const DataEntryAltRedirect = async () => {
  try {
    const tools = await toolService.findAll({
      distinct: true,
    });
    let RedirectEntries = [];

    for (let tool of tools) {
      // Define the mappings for old and new URL structures based on pricing types
      const pricingTypes = ["free", "premium", "freemium"];
      for (let pricingType of pricingTypes) {
        let newUrl = `/tool/alternative/${tool.slug}/${pricingType}`;
        let newPricingValue = pricingType === "premium" ? "paid" : pricingType; // Map 'premium' to 'paid'
        let oldUrl = `/tool/alternative/${tool.slug}?pricing=${newPricingValue}`;

        // Push the payload for each pricing type into the RedirectEntries array
        RedirectEntries.push({
          old: oldUrl,
          new: newUrl,
          isPermanent: true,
          AdminId: 2,
        });
      }
    }

    // Bulk create Redirect entries
    if (RedirectEntries.length > 0) {
      await service.bulkCreate(RedirectEntries);
      console.log(
        `New Redirect entries created for ${RedirectEntries.length / 3} alt.`
      );
    }
  } catch (error) {
    console.error(error);
  }
};

// To run the function
// DataEntryAltRedirect();
