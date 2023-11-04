const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    faqs: Joi.array(),
  }),
  update: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    faqs: Joi.array(),
  }),
};
