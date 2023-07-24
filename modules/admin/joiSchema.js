const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  edit: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
  }),
};
