const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    blogCommentReplyId: Joi.number().required(),
    userId: Joi.number(),
  }),
  update: Joi.object().keys({
    blogCommentReplyId: Joi.number(),
    userId: Joi.number(),
  }),
};
