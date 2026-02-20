/**
 * Tool Comparison Controller
 * 
 * Handles API requests for tool comparison.
 */
const service = require("./service");
const Joi = require("joi");

const compareSchema = Joi.object({
    slugs: Joi.string().required().custom((value, helpers) => {
        const slugArray = value.split(',').map(s => s.trim()).filter(Boolean);
        if (slugArray.length < 2 || slugArray.length > 5) {
            return helpers.message("Please provide between 2 and 5 tools to compare");
        }
        return slugArray;
    }, "Slug array parsing")
});

/**
 * Compare tools by slugs.
 * Expects query param `slugs` as comma-separated list.
 * e.g. GET /api/v1/compare?slugs=tool1,tool2
 */
exports.compare = async (req, res, next) => {
    try {
        const { error, value } = compareSchema.validate(req.query);
        if (error) {
            return res.status(400).json({
                status: "fail",
                message: error.details[0].message,
            });
        }

        const slugArray = value.slugs;

        // Analytics Hook
        console.info(`[ANALYTICS] Tool Comparison Requested: ${slugArray.join(' vs ')}`);

        const data = await service.compareBySlugs(slugArray);

        res.status(200).json({
            status: "success",
            count: data.tools.length,
            data: data.tools,
            sharedFeatures: data.sharedFeatures,
        });
    } catch (err) {
        next(err);
    }
};
