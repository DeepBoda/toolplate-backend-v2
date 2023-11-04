"use strict";
const service = require("./service");
const toolService = require("../tool/service");
const ToolCategory = require("../toolCategory/model");

const DataEntrySeo = async () => {
  try {
    const Tools = await toolService.findAll({
      include: {
        model: ToolCategory,
      },
    });

    for (let i in Tools) {
      const title = `${Tools[i].title} - Key Features, Reviews, Pricing, & Alternative Tools`;
      const categoryNames = Tools[i].toolCategories
        .map((category) => category.name)
        .join(" and ");
      const description = `Explore ${Tools[i].title} on Toolplate: a ${Tools[i].price} ${categoryNames} tool: Read in-depth features and details, user reviews, pricing, and find alternative tools of ${Tools[i].title}. Your one-stop resource for ${Tools[i].title} insights`;

      const payload = {
        title: title,
        description: description,
      };

      const [data, created] = await service.findOrCreate({
        where: { toolId: Tools[i].id },
        defaults: payload,
      });

      if (created) {
        console.log("New SEO entry created for tool ", Tools[i].id);
      } else {
        console.log("SEO entry already exists for tool ", Tools[i].id);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

DataEntrySeo();
