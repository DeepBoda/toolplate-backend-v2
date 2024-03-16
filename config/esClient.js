// esClient.js
const { Client } = require("@elastic/elasticsearch");
const fs = require("fs");

const client = new Client({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "MfoNqDPASXMx*P8G4MKa",
  },
  // ssl: {
  //   ca: fs.readFileSync(__dirname + "/cert.pem"),
  // },
});

module.exports = client;
