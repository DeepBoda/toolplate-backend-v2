const { Client } = require("@elastic/elasticsearch");
const fs = require("fs");
const path = require("path");
const blog = require("../modules/blog/service");
const tool = require("../modules/tool/service");
const { Op } = require("sequelize");
const redisClient = require("../utils/redis");

const certificatePath = path.join(__dirname, "certificate.crt");

// Create Elasticsearch client
// const client = new Client({
//   node: "http://localhost:9200",
//   auth: {
//     username: "elastic",
//     password: "sdXBClIwLXjBHveJmqIh",
//   },
//   ssl: {
//     ca: fs.readFileSync(certificatePath),
//   },
// });

const client = new Client({
  cloud: {
    id: "7aa0b035a3bf481fb019cce870fc8f69:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDVkNWJmZGI3ZTU5YTQ4ODA4ZmRiOTQ4Njg5ODhjM2ExJDg3MjVmYjE0ODJlYjQyZGU5NWRkZTYxODg2MzQ2M2Mz",
  },
  auth: {
    username: "elastic",
    password: "ANwJX5v9yyEVLxcg4bJAJFkE",
  },
});
const insertBulkData = async () => {
  try {
    const blogs = await blog.findAll({
      attributes: ["slug", "id", "description", "title"],
    });
    const tools = await tool.findAll({
      attributes: ["slug", "id", "description", "title"],
    });
    // Create the index
    const index = "search";
    // Generate and index random documents
    const bulkData = [];
    for (let i = 0; i < blogs.length; i++) {
      let blog = blogs[i].toJSON();
      const document = {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        description: blog.description,
        image: `${process.env.BUCKET_URL}/blog_${blog.id}_360_250.avif`,
        type: "blog",
      };
      bulkData.push({ index: { _index: index } }, document);
    }
    for (let i = 0; i < tools.length; i++) {
      let tool = tools[i].toJSON();
      const document = {
        id: tool.id,
        title: tool.title,
        slug: tool.slug,
        description: tool.description,
        image: `${process.env.BUCKET_URL}/tool_${tool.id}_120_120.avif`,
        type: "tool",
      };
      bulkData.push({ index: { _index: index } }, document);
    }
    console.log(bulkData);
    await client.indices.delete({ index });
    console.log(`Index '${index}' deleted successfully.`);
    await client.bulk({ body: bulkData });

    console.log(`Generated documents in the "${index}" index.`);
  } catch (error) {
    console.error("Error generating dataset:", error);
  }
};
const showIndices = async () => {
  try {
    const { body } = await client.indices.get({ index: "_all" });
    const indices = Object.keys(body);
    console.log("Indices:");
    console.log(indices);
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
  await client.indices.create({ index: indexName });
  console.log("Index created");
};
exports.search = async (searchTerms, limit = 10) => {
  try {
    const startTime = Date.now();

    const body = await client.search({
      index: "blog",
      body: {
        query: {
          bool: {
            should: [
              {
                match: {
                  title: {
                    query: searchTerms,
                    fuzziness: "AUTO",
                    operator: "and",
                  },
                },
              },
              {
                wildcard: {
                  title: {
                    value: `${searchTerms}*`,
                  },
                },
              },
              {
                match_phrase_prefix: {
                  title: {
                    query: searchTerms,
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
    return body.hits.hits.map((hit) => hit._source);
  } catch (error) {
    console.error("Error performing search:", error);
  }
};

exports.refillElasticData = async (req, res, next) => {
  try {
    await insertBulkData();

    await redisClient.hDel(`searchAll?searchTerms=*`);
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.error(error);
  }
};
