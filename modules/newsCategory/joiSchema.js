const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string(),
    title: Joi.string(),
    description: Joi.string(),
  }),
  update: Joi.object().keys({
    name: Joi.string(),
    image: Joi.string(),
    title: Joi.string(),
    description: Joi.string(),
  }),
};
