const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    blogId: Joi.number().required(),
    userId: Joi.number().allow(null),
  }),
  update: Joi.object().keys({
    blogId: Joi.number(),
    userId: Joi.number().allow(null),
  }),
};
