/**
 * Tool Comparison Controller
 * 
 * Handles API requests for tool comparison.
 */
const service = require("./service");

/**
 * Compare tools by slugs.
 * Expects query param `slugs` as comma-separated list.
 * e.g. GET /api/v1/compare?slugs=tool1,tool2
 */
exports.compare = async (req, res, next) => {
    try {
        const { slugs } = req.query;

        if (!slugs) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide 'slugs' query parameter (comma-separated list of slugs)",
            });
        }

        const slugArray = slugs.split(',').map(s => s.trim()).filter(Boolean);

        if (slugArray.length < 2) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide at least 2 tools to compare",
            });
        }

        const data = await service.compareBySlugs(slugArray);

        res.status(200).json({
            status: "success",
            count: data.length,
            data,
        });
    } catch (error) {
        next(error);
    }
};
