const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    listingId: Joi.number().required(),
    AdminId: Joi.number().allow(null),
    index: Joi.number(),
  }),
  update: Joi.object().keys({
    listingId: Joi.number(),
    AdminId: Joi.number().allow(null),
    index: Joi.number(),
  }),
};
