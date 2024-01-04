const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string(),
    description: Joi.string().allow(null),
    overview: Joi.string().allow(null),
    mainCategoryId: Joi.number().required(),
  }),
  update: Joi.object().keys({
    name: Joi.string(),
    image: Joi.string(),
    description: Joi.string().allow(null),
    overview: Joi.string().allow(null),
    mainCategoryId: Joi.number(),
  }),
};
