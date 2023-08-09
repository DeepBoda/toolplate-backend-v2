const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    toolId: Joi.number().required(),
  }),
  update: Joi.object().keys({
    toolId: Joi.number(),
  }),
};
