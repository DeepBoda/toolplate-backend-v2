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

exports.findOrCreate = async (data) => {
  return Model.findOrCreate(data);
};

exports.updateOrCreate = async (data) => {
  return Model.upsert(data);
};

exports.findOneAndUpdate = async (data, conditions) => {
  const record = await Model.findOne(conditions);
  if (record) {
    return record.update(data);
  }
  return null;
};

exports.verifyReferral = async (referredCode) => {
  return await Model.count({
    where: {
      myReferralCode: referredCode,
    },
  });
};

exports.isPrivateAcc = async (ModelId) => {
  return Model.count({
    where: {
      id: ModelId,
      privateAcc: true,
    },
  });
};
