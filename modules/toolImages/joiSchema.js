const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    image: Joi.string(),
    alt: Joi.string().allow(null),
    toolId: Joi.number(),
  }),
  update: Joi.object().keys({
    image: Joi.string(),
    alt: Joi.string().allow(null),
    toolId: Joi.number(),
  }),
};
