/**
 * Tool Comparison Controller
 * 
 * Handles POST /api/v1/tool/compare
 * Returns structured comparison data for 2-4 tools side-by-side.
 * 
 * @module modules/tool/compareController
 */

"use strict";

const { Op } = require("sequelize");
const service = require("./service");
const redisUtils = require("../../utils/redis");

// Cache TTL for comparison results (30 minutes)
const COMPARISON_CACHE_TTL = 1800;

/**
 * Parse JSON fields that are stored as strings in the database.
 * Returns the parsed array, or the original value if already an array,
 * or an empty array if parsing fails.
 * 
 * @param {*} value - Value to parse
 * @returns {Array} - Parsed array
 */
const parseJsonField = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

/**
 * Format a tool record for comparison response.
 * Extracts only the fields needed for comparison.
 * 
 * @param {Object} tool - Sequelize tool instance
 * @returns {Object} - Formatted comparison tool
 */
const formatToolForComparison = (tool) => {
    const data = tool.toJSON ? tool.toJSON() : tool;
    return {
        title: data.title,
        slug: data.slug,
        description: data.description,
        image: data.image,
        price: data.price,
        ratingsAverage: data.ratingsAverage || 0,
        totalRatings: data.totalRatings || 0,
        pros: parseJsonField(data.pros),
        cons: parseJsonField(data.cons),
        link: data.link,
    };
};

/**
 * POST /api/v1/tool/compare
 * 
 * Compare 2-4 tools side-by-side.
 * 
 * Request body: { slugs: ["chatgpt", "claude", ...] }
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
exports.compareTools = async (req, res, next) => {
    try {
        const { slugs } = req.body || {};

        // ── Validation ──
        if (!slugs || !Array.isArray(slugs) || slugs.length < 2 || slugs.length > 4) {
            return res.status(400).json({
                status: 400,
                message: "Provide between 2 and 4 tool slugs for comparison",
            });
        }

        // ── Cache check ──
        // Sort slugs for consistent cache keys regardless of input order
        const sortedSlugs = [...slugs].sort();
        const cacheKey = `compare:${sortedSlugs.join(":")}`;

        const cached = await redisUtils.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                status: 200,
                data: cached,
            });
        }

        // ── Fetch tools from database ──
        const tools = await service.findAll({
            where: {
                slug: { [Op.in]: slugs },
            },
            attributes: [
                "id",
                "title",
                "slug",
                "description",
                "image",
                "price",
                "ratingsAverage",
                "totalRatings",
                "pros",
                "cons",
                "link",
            ],
        });

        // ── Check all slugs were found ──
        if (tools.length !== slugs.length) {
            const foundSlugs = tools.map((t) => (t.toJSON ? t.toJSON().slug : t.slug));
            const missingSlugs = slugs.filter((s) => !foundSlugs.includes(s));
            return res.status(404).json({
                status: 404,
                message: `Tool not found: ${missingSlugs.join(", ")}`,
            });
        }

        // ── Order tools to match input order ──
        const toolMap = {};
        tools.forEach((tool) => {
            const data = tool.toJSON ? tool.toJSON() : tool;
            toolMap[data.slug] = tool;
        });

        const orderedTools = slugs.map((slug) => formatToolForComparison(toolMap[slug]));

        // ── Build response ──
        const responseData = {
            tools: orderedTools,
            comparedAt: new Date().toISOString(),
        };

        // ── Cache result ──
        redisUtils.set(cacheKey, responseData, COMPARISON_CACHE_TTL);

        return res.status(200).json({
            status: 200,
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};
