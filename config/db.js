const Sequelize = require("sequelize");
require("dotenv").config();
const env = process.env.NODE_ENV;
const db_config = require("./config")[env];
const sequelize = new Sequelize(
  db_config.database,
  db_config.username,
  db_config.password,
  db_config
  // {
  //   logging: false,
  // }
);

console.log(db_config);
module.exports = sequelize;
