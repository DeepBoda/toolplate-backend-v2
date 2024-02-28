const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    blogId: Joi.number().required(),
    AdminId: Joi.number().allow(null),
    index: Joi.number(),
  }),
  update: Joi.object().keys({
    blogId: Joi.number(),
    AdminId: Joi.number().allow(null),
    index: Joi.number(),
  }),
};
