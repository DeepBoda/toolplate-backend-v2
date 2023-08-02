const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    blogId: Joi.number().required(),
  }),
  update: Joi.object().keys({
    blogId: Joi.number(),
  }),
};
