const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    reply: Joi.string().required(),
    listingCommentId: Joi.number(),
    userId: Joi.number(),
  }),
  update: Joi.object().keys({
    reply: Joi.string(),
    listingCommentId: Joi.number(),
    userId: Joi.number(),
  }),
};
