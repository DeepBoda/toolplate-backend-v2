const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    name: Joi.string().required(),
    icon: Joi.string(),
  }),
  update: Joi.object().keys({
    name: Joi.string(),
    icon: Joi.string(),
  }),
};
