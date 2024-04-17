const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    old: Joi.string().required(),
    new: Joi.string().required(),
    isPermanent: Joi.boolean(),
    AdminId: Joi.number(),
  }),
  update: Joi.object().keys({
    old: Joi.string(),
    new: Joi.string(),
    isPermanent: Joi.boolean(),
  }),
};
