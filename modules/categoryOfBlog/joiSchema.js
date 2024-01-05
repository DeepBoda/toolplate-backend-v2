const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow(null),
  }),
  update: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string().allow(null),
  }),
};
