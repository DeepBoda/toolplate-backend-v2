const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    toolId: Joi.number().required(),
    userId: Joi.number().allow(null),
  }),
  update: Joi.object().keys({
    toolId: Joi.number(),
    userId: Joi.number().allow(null),
  }),
};
