const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    submitToolId: Joi.number().required(),
    categoryId: Joi.number().required(),
  }),
  update: Joi.object().keys({
    submitToolId: Joi.number(),
    categoryId: Joi.number(),
  }),
};
