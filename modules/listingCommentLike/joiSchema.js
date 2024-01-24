const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    listingCommentId: Joi.number().required(),
    userId: Joi.number(),
  }),
  update: Joi.object().keys({
    listingCommentId: Joi.number(),
    userId: Joi.number(),
  }),
};
