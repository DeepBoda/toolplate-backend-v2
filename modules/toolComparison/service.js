/**
 * Tool Comparison Service
 * 
 * Logic for comparing multiple tools.
 * Fetches tool data by slugs and structures it for frontend comparison.
 */

const { Op } = require("sequelize");
const toolService = require("../tool/service");
const categoryService = require("../category/service");
const ToolCategory = require("../toolCategory/model");
const Category = require("../category/model");
const MainCategory = require("../mainCategory/model");
const ToolImage = require("../toolImages/model");
const { toolAttributes, categoryAttributes } = require("../../constants/queryAttributes");

/**
 * Compare tools by their slugs
 * @param {string[]} slugs - Array of tool slugs
 * @returns {Promise<Object[]>} - Array of detailed tool objects
 */
const compareBySlugs = async (slugs) => {
    if (!slugs || slugs.length === 0) return [];

    // Limit comparison to 4 tools to prevent abuse/load
    const toolsToCompare = slugs.slice(0, 4);

    const tools = await toolService.findAll({
        where: {
            slug: {
                [Op.in]: toolsToCompare,
            },
            // Assume we only compare published tools?
            // release: { [Op.lte]: moment() } // Requires moment.
            // For now, let's keep it simple.
        },
        attributes: [
            ...toolAttributes,
            // Add more details if needed for comparison (e.g. pricing, features)
        ],
        include: [
            {
                model: ToolImage,
                attributes: ["id", "image", "alt"],
            },
            {
                model: ToolCategory,
                attributes: ["categoryId"],
                include: {
                    model: Category,
                    attributes: categoryAttributes,
                    include: {
                        model: MainCategory,
                        attributes: ["id", "name"],
                    },
                },
            },
        ],
    });

    // Sort tools to match input order?
    // Not strictly necessary but nice for UI.
    // const sortedTools = toolsToCompare.map(slug => tools.find(t => t.slug === slug)).filter(Boolean);

    return tools;
};

module.exports = {
    compareBySlugs,
};
