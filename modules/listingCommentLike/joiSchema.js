const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    blogCommentId: Joi.number().required(),
    userId: Joi.number(),
  }),
  update: Joi.object().keys({
    blogCommentId: Joi.number(),
    userId: Joi.number(),
  }),
};
