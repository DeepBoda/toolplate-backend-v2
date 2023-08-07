const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string(),
    readTime: Joi.number().required(),
    overview: Joi.string().required(),
    categories: Joi.string().required(),
    tags: Joi.string().required(),
  }),
  update: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    image: Joi.string(),
    readTime: Joi.number(),
    overview: Joi.string(),
    categories: Joi.string(),
    tags: Joi.string(),
  }),
};
