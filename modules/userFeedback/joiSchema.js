const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    feedback: Joi.string().required(),
  }),
};
