const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    listingId: Joi.number().required(),
    toolId: Joi.number().required(),
    description: Joi.string(),
  }),
  update: Joi.object().keys({
    listingId: Joi.number(),
    toolId: Joi.number(),
    description: Joi.string(),
  }),
};
