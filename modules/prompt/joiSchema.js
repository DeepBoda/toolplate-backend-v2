const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    search: Joi.string().required(),
    userId: Joi.number(),
  }),
  update: Joi.object().keys({
    search: Joi.string(),
    userId: Joi.number(),
  }),
};
