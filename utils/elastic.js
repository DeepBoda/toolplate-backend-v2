const client = require("../config/esClient");
const toolService = require("../modules/tool/service");
const categoryService = require("../modules/category/service");
const redisClient = require("../utils/redis");
const MainCategory = require("../modules/mainCategory/model");
const ToolCategory = require("../modules/toolCategory/model");
const Category = require("../modules/category/model");

const insertBulkData = async () => {
  try {
    // Define the index
    const index = "search";

    // Check if the index exists before trying to delete it
    const indexExists = await client.indices.exists({ index });
    if (indexExists) {
      await client.indices.delete({ index });
      console.log(`Index '${index}' deleted successfully.`);
    }

    // Create the index
    // await client.indices.create({ index });
    // console.log(`Index '${index}' created successfully.`);

    // Bulk data array
    const bulkData = [];

    // Insert categories
    const categories = await categoryService.findAll({
      attributes: ["slug", "id", "name", "image"],
      include: {
        model: MainCategory,
        attributes: ["name"],
      },
    });
    categories.forEach((category) => {
      const categoryData = category.toJSON();
      bulkData.push(
        { index: { _index: index } },
        {
          id: categoryData.id,
          title: categoryData.name,
          slug: categoryData.slug,
          image: categoryData.image,
          category: categoryData.mainCategory.name,
          type: "category",
        }
      );
    });

    // Insert tools
    const tools = await toolService.findAll({
      attributes: ["title", "slug", "id", "description"],
      include: {
        model: ToolCategory,
        attributes: ["categoryId"],
        include: {
          model: Category,
          attributes: ["name"],
        },
      },
    });

    tools.forEach((tool) => {
      const toolData = tool.toJSON();
      const categoryNames = toolData.toolCategories
        .map((tc) => tc.category.name)
        .join(", "); // Join category names with a comma if there are multiple

      bulkData.push(
        { index: { _index: index } },
        {
          id: toolData.id,
          title: toolData.title,
          slug: toolData.slug,
          image: `${process.env.CDN_URL}/tool_${toolData.id}_60_60.webp`,
          category: categoryNames,
          type: "tool",
        }
      );
    });

    // Perform the bulk index operation
    await client.bulk({ body: bulkData });

    console.log(
      `Bulk data inserted. ${categories.length} categories and ${tools.length} tools added to the "${index}" index.`
    );
  } catch (error) {
    console.error("Error during bulk data insertion:", error);
  }
};
const showIndices = async () => {
  try {
    const { body } = await client.indices.get({ index: "_all" });
    if (body) {
      const indices = Object.keys(body);
      console.log("Indices:");
      console.log(indices);
    } else {
      console.log("No indices found.");
    }
  } catch (error) {
    console.error("Error retrieving indices:", error);
  }
};
const deleteIndex = async (indexName) => {
  try {
    const { body } = await client.indices.delete({ index: indexName });
    console.log(`Index '${indexName}' deleted successfully.`);
  } catch (error) {
    console.error("Error deleting index:", error);
  }
};
const getIndexDataCount = async () => {
  try {
    const { body: indices } = await client.cat.indices({ format: "json" });

    // Check if indices is undefined or not iterable
    if (!indices || !Array.isArray(indices)) {
      console.log("No indices found.");
      return;
    }

    for (const index of indices) {
      // Skip the .geoip_databases index
      if (index.index === ".geoip_databases") {
        continue;
      }

      const { body: count } = await client.count({ index: index.index });
      console.log(`Index: ${index.index}, Document Count: ${count.count}`);
    }
  } catch (error) {
    console.error("Error retrieving index document count:", error);
  }
};
const listAllIndexes = async () => {
  try {
    const body = await client.cat.indices({ format: "json" });
    console.log(body);
  } catch (error) {
    console.error("An error occurred:", error);
  }
};
const createIndex = async (indexName) => {
  try {
    // Original createIndex function enhanced with an example mapping
    const indexExists = await client.indices.exists({ index: indexName });
    if (indexExists.body) {
      // Ensure to access the `.body` property
      console.log(`Index '${indexName}' already exists`);
      return;
    }

    await client.indices.create({
      index: indexName,
      body: {
        settings: {
          /* Your index settings */
        },
        mappings: {
          properties: {
            id: { type: "integer" },
            title: { type: "text" },
            slug: { type: "keyword" },
            description: { type: "text" },
            image: { type: "text" },
            type: { type: "keyword" },
          },
        },
      },
    });
    console.log(`Index '${indexName}' created successfully`);
  } catch (error) {
    console.error(`Error creating index '${indexName}':`, error);
  }
};
exports.refillData = async (req, res, next) => {
  try {
    await insertBulkData();

    await redisClient.hDel(`ES?search=*`);
    res.status(200).json({
      status: "success",
      message: "Elastic Search data refilled successfully!",
    });
  } catch (error) {
    console.error(error);
  }
};

function preprocessSearchTerms(searchTerms, keywordsToDeemphasize) {
  // Split the searchTerms into an array of words
  let termsArray = searchTerms.split(" ");

  // Filter out the keywords to deemphasize
  termsArray = termsArray.filter(
    (term) => !keywordsToDeemphasize.includes(term.toLowerCase())
  );

  // Join the remaining terms back into a string
  const processedSearchTerms = termsArray.join(" ");

  return processedSearchTerms;
}

exports.searchTool = async (searchTerms, limit = 10) => {
  try {
    const startTime = Date.now();
    const processedSearchTerms = preprocessSearchTerms(searchTerms, [
      "i",
      "want",
      "to",
      "for",
      "looking",
      "how",
      "do",
      "find",
      "can",
      "this",
      "that",
      "help",
      "you",
      "please",
      "a",
      "an",
      "the",
      "best",
      "top",
      "free",
      "paid",
      "get",
      "suggest",
      "need",
      "ai",
      "tool",
      "tools",
    ]);

    const body = await client.search({
      index: "search",
      body: {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: processedSearchTerms,
                  fields: ["title^3", "category"],
                  fuzziness: "AUTO", // Consider adjusting fuzziness based on query length or context
                  type: "best_fields", // Prefer the best match across fields
                },
              },
              {
                match_phrase_prefix: {
                  title: {
                    query: processedSearchTerms,
                    slop: 3, // Allow for some flexibility in phrase matching
                    boost: 10,
                  },
                },
              },
              {
                match_phrase_prefix: {
                  category: {
                    query: processedSearchTerms,
                    slop: 3, // Similar flexibility for category
                    boost: 5, // Boosting less than title to maintain relevance
                  },
                },
              },
            ],
            minimum_should_match: 1, // Ensure at least one condition must match
          },
        },
        // size: limit,
      },
    });

    const endTime = Date.now();
    console.log("Query time:", endTime - startTime);
    return body.hits.hits.map((hit) => hit._source);
  } catch (error) {
    console.error("Error performing search:", error);
    return []; // Handle error appropriately
  }
};
