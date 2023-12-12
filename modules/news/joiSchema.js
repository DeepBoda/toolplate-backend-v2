const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string(),
    link: Joi.string().required(),
    newsCategoryId: Joi.number().required(),
  }),
  update: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    image: Joi.string(),
    link: Joi.string(),
    newsCategoryId: Joi.number(),
  }),
};
