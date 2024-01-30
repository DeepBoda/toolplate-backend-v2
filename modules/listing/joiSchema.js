const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    title: Joi.string().required(),
    slug: Joi.string().required(),
    description: Joi.string().required().allow(null),
    image: Joi.string(),
    alt: Joi.string().allow(null),
    categories: Joi.string().required(),
    tools: Joi.string().required(),
  }),
  update: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string().allow(null),
    slug: Joi.string(),
    image: Joi.string(),
    alt: Joi.string().allow(null),
    categories: Joi.string(),
    tools: Joi.string(),
  }),
  meta: Joi.object().keys({
    metaTitle: Joi.string(),
    metaDescription: Joi.string().allow(null),
  }),
};
