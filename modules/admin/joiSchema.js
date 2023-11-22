const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  update: Joi.object().keys({
    name: Joi.string().required(),
    password: Joi.string().required(),
  }),
};
