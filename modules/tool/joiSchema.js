const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string(),
    price: Joi.string().valid("Free", "Premium", "Freemium").required(),
    previews: Joi.array(),
    overview: Joi.string(),
    link: Joi.string().required(),
    videos: Joi.array().allow(null),
    categories: Joi.string().required(),
    release: Joi.date(),
  }),
  update: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    image: Joi.string(),
    price: Joi.string().valid("Free", "Premium", "Freemium"),
    overview: Joi.string(),
    link: Joi.string(),
    videos: Joi.array(),
    categories: Joi.string(),
    release: Joi.date(),
  }),
};
