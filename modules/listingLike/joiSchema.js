const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    listingId: Joi.number().required(),
    userId: Joi.number().allow(null),
  }),
  update: Joi.object().keys({
    listingId: Joi.number(),
    userId: Joi.number().allow(null),
  }),
};
