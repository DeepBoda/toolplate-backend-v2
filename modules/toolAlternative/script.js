"use strict";

const sequelize = require("../../config/db");
const toolService = require("../tool/service");
const service = require("./service");
const ToolCategory = require("../toolCategory/model");
const Category = require("../category/model");
const { Op } = require("sequelize");
const moment = require("moment");

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

    for (let tool of Tools) {
      const categoryIds = tool.toolCategories.map(
        (toolCategory) => toolCategory.categoryId
      );
      const where = {};

      where["$toolCategories.categoryId$"] = { [Op.in]: categoryIds };
      // Find tools with the same category  IDs
      const alternativesCount = await toolService.count({
        where: {
          id: { [Op.ne]: tool.id },
          release: {
            [Op.lte]: moment(),
          },
        },
        distinct: true, // Add this option to ensure accurate counts
        include: [
          {
            model: ToolCategory,
            attributes: ["categoryId"],
            where,
          },
        ],
      });

      const title = `Top ${alternativesCount} Alternatives to ${tool.title} | Toolplate`;
      const description = `Discover "${alternativesCount}" AI-powered alternatives to ${tool.title}. Explore different options to enhance productivity and efficiency on Toolplate.ai.`;

      const payload = {
        title: title,
        description: description,
      };
      // console.log("------", payload);
      // Find the existing record
      const existingData = await service.findOne({
        where: { toolId: tool.id },
      });

      if (existingData) {
        // If the record exists, update it with new data
        await service.update(payload, { where: { toolId: tool.id } });
        console.log("SEO entry updated for tool ", tool.id);
      } else {
        // If the record doesn't exist, create a new one
        await service.create({ toolId: tool.id, ...payload });
        console.log("New SEO entry created for tool ", tool.id);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// To run the function
DataEntrySeo();
