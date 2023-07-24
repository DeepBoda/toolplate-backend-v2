require("dotenv").config();
const config = {
  test: {
    username: "root",
    password: "password",
    database: "nodeBoilerplate",
    host: "localhost",
    dialect: "mysql",
  },
  development: {
    username: process.env.STAGUSERNAME,
    password: process.env.STAGPASSWORD,
    database: process.env.STAGDATABASE,
    host: process.env.STAGHOST,
    port: 3306,
    dialect: "mysql",
    dialectOptions: {
      ssl: "Amazon RDS",
    },
    pool: {
      max: 20,
      min: 0,
      acquire: 100000,
      idle: 10000,
      evict: 10000,
    },
    language: "en",
  },
  production: {
    username: process.env.PRODUSERNAME,
    password: process.env.PRODPASSWORD,
    database: process.env.PRODDATABASE,
    host: process.env.PRODHOST,
    port: 3306,
    dialect: "mysql",
    dialectOptions: {
      ssl: "Amazon RDS",
    },
    pool: {
      max: 200,
      min: 0,
      acquire: 100000,
      idle: 10000,
      evict: 10000,
    },
    language: "en",
  },
};

module.exports = config;
