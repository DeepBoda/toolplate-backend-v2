const { searchTool } = require("../../utils/elastic");

exports.elasticSearch = async (req, res, next) => {
  try {
    const { search } = req.body;
    // console.log("req.body : ", req.body);
    const limit = req.body?.limit ? req.body?.limit : 10;
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
