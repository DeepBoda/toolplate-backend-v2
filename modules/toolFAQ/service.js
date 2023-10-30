"use strict";
const Model = require("./model");

exports.create = async (data) => {
  return Model.create(data);
};

exports.bulkCreate = async (data) => {
  return Model.bulkCreate(data);
};

exports.findOne = async (conditions) => {
  return Model.findOne(conditions);
};
exports.findOrCreate = async (data) => {
  return await Model.findOrCreate(data);
};
exports.findAll = async (conditions) => {
  return Model.findAll(conditions);
};

exports.findAndCountAll = async (conditions) => {
  return Model.findAndCountAll(conditions);
};

exports.update = async (data, conditions) => {
  return Model.update(data, conditions);
};

exports.delete = async (conditions) => {
  return Model.destroy(conditions);
};

exports.count = async (conditions) => {
  return Model.count(conditions);
};
