"use strict";

const service = require("./service");

const DataEntrySeo = async () => {
  try {
    const categories = await service.findAll();

    for (let category of categories) {
      const title = `Top ${category.name} in 2024 - Top Largest AI Tools Directory - Toolplate.ai`;
      const description = `Looking for ${category.name}? Check out top ${category.name} by Top Largest AI Tools Directory - Toolplate.ai. Browse all our perfect listing ${category.name} at a glance.`;

      const payload = {
        metaTitle: title,
        metaDescription: description,
      };

      // If the record exists, update it with new data
      await service.update(payload, { where: { id: category.id } });
      console.log("SEO entry updated for Main Category: ", category.id);
    }
  } catch (error) {
    console.error(error);
  }
};

// To run the function
DataEntrySeo();
