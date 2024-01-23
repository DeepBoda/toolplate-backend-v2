const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    listingId: Joi.number().required(),
    categoryOfListingId: Joi.number().required(),
  }),
  update: Joi.object().keys({
    listingId: Joi.number(),
    categoryOfListingId: Joi.number(),
  }),
};
