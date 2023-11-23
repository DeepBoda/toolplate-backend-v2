const Sequelize = require("sequelize");
require("dotenv").config();
const env = process.env.NODE_ENV;
const db_config = require("./config")[env];
const sequelize = new Sequelize(db_config);
// console.log(db_config);
module.exports = sequelize;
