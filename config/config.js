require("dotenv").config();
const { readFileSync } = require("fs");

const config = {
  test: {
    username: "root",
    password: "password",
    database: "db",
    host: "localhost",
    dialect: "mysql",
  },
  development: {
    username: process.env.DEVUSERNAME,
    password: process.env.DEVPASSWORD,
    database: process.env.DEVDATABASE,
    host: process.env.DEVHOST,
    port: 3306,
    dialect: "mysql",
    pool: {
      max: 50,
      min: 0,
      acquire: 60000,
      idle: 10000,
      evict: 10000,
      acquireTimeout: 60000,
    },
    language: "en",
  },
  production: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    port: 3306,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        ca: readFileSync(__dirname + "/ap-south-1-bundle.pem"),
      },
    },
    pool: {
      max: 250,
      min: 0,
      acquire: 60000,
      idle: 10000,
      evict: 10000,
      acquireTimeout: 60000,
    },
    language: "en",
  },
};

module.exports = config;
