const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string(),
    description: Joi.string().allow(null),
    overview: Joi.string().allow(null),
    bottomOverview: Joi.string().allow(null),
    categoryId: Joi.number(),
  }),
  update: Joi.object().keys({
    name: Joi.string(),
    image: Joi.string(),
    description: Joi.string().allow(null),
    overview: Joi.string().allow(null),
    bottomOverview: Joi.string().allow(null),
    categoryId: Joi.number(),
  }),
};
