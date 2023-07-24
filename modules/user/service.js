"use strict";
const Model = require("./model");

exports.create = async (data) => {
  return Model.create(data);
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
