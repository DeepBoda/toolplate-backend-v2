const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    toolId: Joi.number().required(),
    AdminId: Joi.number().allow(null),
    index: Joi.number(),
  }),
  update: Joi.object().keys({
    toolId: Joi.number(),
    AdminId: Joi.number().allow(null),
    index: Joi.number(),
  }),
};
