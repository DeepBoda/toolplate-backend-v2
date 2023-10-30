const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    toolId: Joi.number().required(),
    faqs: Joi.object().required(),
  }),
  update: Joi.object().keys({
    toolId: Joi.number(),
    faqs: Joi.object(),
  }),
};
