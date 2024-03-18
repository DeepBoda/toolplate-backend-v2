const { searchTool } = require("../../utils/elastic");

exports.elasticSearch = async (req, res, next) => {
  try {
    const { search } = req.params;
    const limit = req.query?.limit ? req.query?.limit : 10;
    const data = await searchTool(search, limit);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
