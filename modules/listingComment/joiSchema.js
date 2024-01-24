const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    comment: Joi.string().required(),
    listingId: Joi.number(),
    userId: Joi.number(),
  }),
  update: Joi.object().keys({
    comment: Joi.string(),
    listingId: Joi.number(),
    userId: Joi.number(),
  }),
};
