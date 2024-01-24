const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    listingCommentReplyId: Joi.number().required(),
    userId: Joi.number(),
  }),
  update: Joi.object().keys({
    listingCommentReplyId: Joi.number(),
    userId: Joi.number(),
  }),
};
