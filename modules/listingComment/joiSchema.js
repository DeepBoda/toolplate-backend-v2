const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    comment: Joi.string().required(),
    blogId: Joi.number(),
    userId: Joi.number(),
  }),
  update: Joi.object().keys({
    comment: Joi.string(),
    blogId: Joi.number(),
    userId: Joi.number(),
  }),
};
