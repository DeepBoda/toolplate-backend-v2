const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    newsId: Joi.number().required(),
    userId: Joi.number().allow(null),
  }),
  update: Joi.object().keys({
    newsId: Joi.number(),
    userId: Joi.number().allow(null),
  }),
};
