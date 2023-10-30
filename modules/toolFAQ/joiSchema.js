const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    toolId: Joi.number().required(),
    faqs: Joi.array(),
  }),
  update: Joi.object().keys({
    faqs: Joi.array(),
  }),
};
