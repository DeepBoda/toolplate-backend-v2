"use strict";
const Model = require("./model");

exports.create = async (data) => {
  return Model.create(data);
};

exports.bulkCreate = async (data) => {
  return Model.bulkCreate(data);
};

exports.findOne = async (conditions) => {
  return Model.findOne({ where: conditions });
};

exports.findAll = async (conditions) => {
  return Model.findAll({ where: conditions });
};

exports.findAndCountAll = async (conditions) => {
  return Model.findAndCountAll({ where: conditions });
};

exports.update = async (data, conditions) => {
  return Model.update(data, { where: conditions });
};

exports.delete = async (conditions) => {
  return Model.destroy({ where: conditions });
};

exports.count = async (conditions) => {
  return Model.count({ where: conditions });
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
