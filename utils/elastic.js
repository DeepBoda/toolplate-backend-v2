const client = require("../config/esClient");
const toolService = require("../modules/tool/service");
const categoryService = require("../modules/category/service");
const redisClient = require("../utils/redis");

const insertData = async () => {
  try {
    // Fetch data for tools and categories concurrently
    const [tools, categories] = await Promise.all([
      toolService.findAll({
        attributes: ["slug", "id", "title", "description"],
      }),
      categoryService.findAll({
        attributes: ["slug", "id", "name", "description", "image"],
      }),
    ]);

    // Create the index
    const index = "search";

    // Generate bulk data for tools
    const toolsBulkData = tools.map((tool) => ({
      index: { _index: index },
      body: {
        id: tool.id,
        title: tool.title,
        slug: tool.slug,
        description: tool.description,
        image: `${process.env.BUCKET_URL}/tool_${tool.id}_60_60.webp`,
        type: "tool",
      },
    }));

    // Generate bulk data for categories
    const categoriesBulkData = categories.map((category) => ({
      index: { _index: index },
      body: {
        id: category.id,
        title: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        type: "category",
      },
    }));

    // Combine both bulk data arrays
    const bulkData = [...toolsBulkData, ...categoriesBulkData];

    // Bulk insert data
    if (bulkData.length > 0) {
      await client.bulk({ body: bulkData });
      console.log(
        `Generated documents for ${tools.length} tools and ${categories.length} categories in the "${index}" index.`
      );
    } else {
      console.log("No data to insert.");
    }
  } catch (error) {
    console.error("Error generating dataset:", error);
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

const createIndex = async (indexName) => {
  try {
    // Check if the index already exists
    const indexExists = await client.indices.exists({ index: indexName });
    if (indexExists) {
      console.log(`Index '${indexName}' already exists`);
      return;
    }

    // Create the index
    await client.indices.create({ index: indexName });

    // Log success message after index creation
    console.log(`Index '${indexName}' created successfully`);
  } catch (error) {
    // Handle error if index creation fails
    console.error(`Error creating index '${indexName}':`, error);
  }
};

exports.es = async (search, limit = 6) => {
  try {
    const startTime = Date.now();

    let data = await redisClient.get(`ES?search=${search}`);
    if (!data) {
      const body = await client.search({
        index: "search",
        body: {
          query: {
            bool: {
              should: [
                {
                  match: {
                    title: {
                      query: search,
                      fuzziness: "AUTO",
                      operator: "and",
                    },
                  },
                },
                {
                  wildcard: {
                    title: {
                      value: `${search}*`,
                    },
                  },
                },
                {
                  match_phrase_prefix: {
                    title: {
                      query: search,
                      slop: 3, // Allow up to 3 token position differences
                      boost: 10, // Boost the relevance of the match_phrase_prefix query
                    },
                  },
                },
              ],
            },
          },
          size: limit,
        },
      });

      const endTime = Date.now();
      console.log("Query time:", endTime - startTime);
      console.log(body.hits.hits.map((hit) => hit._source));
      const data = body.hits.hits.map((hit) => hit._source);
      redisClient.set(`ES?search=${search}`, data);
    }
    return data;
  } catch (error) {
    console.error("Error performing search:", error);
  }
};

exports.refillData = async (req, res, next) => {
  try {
    await insertData();

    await redisClient.hDel(`ES?search=*`);
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.error(error);
  }
};

const main = async () => {
  await deleteIndex("search");
  await createIndex("search");
  await insertData();
  await showIndices(); // Move this line to after the data insertion
  await getIndexDataCount();
};

// main(); // Call the main function
