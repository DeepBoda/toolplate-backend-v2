const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string(),
    description: Joi.string(),
    categoryId: Joi.number(),
  }),
  update: Joi.object().keys({
    name: Joi.string(),
    image: Joi.string(),
    description: Joi.string(),
    categoryId: Joi.number(),
  }),
};
