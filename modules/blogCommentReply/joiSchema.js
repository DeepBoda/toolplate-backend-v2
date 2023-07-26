const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    reply: Joi.string().required(),
    blogCommentId: Joi.number(),
    userId: Joi.number(),
  }),
  update: Joi.object().keys({
    reply: Joi.string(),
    blogCommentId: Joi.number(),
    userId: Joi.number(),
  }),
};
