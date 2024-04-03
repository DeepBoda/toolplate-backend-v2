// esClient.js
const { Client } = require("@elastic/elasticsearch");
const fs = require("fs");

const client = new Client({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "MfoNqDPASXMx*P8G4MKa",
    // password: "l+h=IiRCetDCNiPN9cNO",
  },
  // ssl: {
  //   ca: fs.readFileSync(__dirname + "/cert.pem"),
  // },
});

// const client = new Client({
//   cloud: {
//     id: "dc7bde501d604739bf61fb060d2c9a51:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJGI0ZDY0ZjUzMThmOTRjZWJhODU4NzAxNTA0NGVkZTgwJDExM2U2NTFmODM2MjRkZjlhYjE1YTBlZmY4Mjk0MjJl",
//   },
//   auth: {
//     username: "Toolplate",
//     password: "ANwJX5v9yyEVLxcg4bJAJFkE",
//   },
// });
module.exports = client;
