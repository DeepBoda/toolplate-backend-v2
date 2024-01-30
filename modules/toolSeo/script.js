"use strict";
const service = require("./service");
const toolService = require("../tool/service");
const ToolCategory = require("../toolCategory/model");
const Category = require("../category/model");

const DataEntrySeo = async () => {
  try {
    const Tools = await toolService.findAll({
      include: {
        model: ToolCategory,
        include: {
          model: Category,
        },
      },
    });

    for (let i in Tools) {
      // const title = `${Tools[i].title} AI - Key Features, Reviews, Pricing, & Alternative Tools`;
      const categoryNames = Tools[i].toolCategories
        .map((c) => c.category.name)
        .join(" and ");
      const description = `Explore ${Tools[i].title} on Toolplate: a ${Tools[i].price} ${categoryNames} tool: Read in-depth features and details, user reviews, pricing, and find alternative tools of ${Tools[i].title}. Your one-stop resource for ${Tools[i].title} insights`;

      const payload = {
        // title: title,
        description: description,
      };

      // Find the existing record
      const existingData = await service.findOne({
        where: { toolId: Tools[i].id },
      });

      if (existingData) {
        // If the record exists, update it with new data
        await service.update(payload, { where: { toolId: Tools[i].id } });
        console.log("SEO entry updated for tool ", Tools[i].id);
      } else {
        // If the record doesn't exist, create a new one
        await service.create({ toolId: Tools[i].id, ...payload });
        console.log("New SEO entry created for tool ", Tools[i].id);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

DataEntrySeo();
