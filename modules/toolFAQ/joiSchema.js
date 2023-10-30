const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    faqs: Joi.array(),
  }),
  update: Joi.object().keys({
    faqs: Joi.array(),
  }),
};
