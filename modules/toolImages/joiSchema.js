const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    image: Joi.string(),
  }),
  update: Joi.object().keys({
    image: Joi.string(),
  }),
};
