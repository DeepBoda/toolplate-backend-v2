const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    title: Joi.string(),
    review: Joi.string(),
    rating: Joi.number().required(),
    toolId: Joi.number(),
    userId: Joi.number(),
  }),
  update: Joi.object().keys({
    title: Joi.string(),
    review: Joi.string(),
  }),
};
