const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    image: Joi.string(),
    toolId: Joi.number(),
  }),
  update: Joi.object().keys({
    image: Joi.string(),
    toolId: Joi.number(),
  }),
};
