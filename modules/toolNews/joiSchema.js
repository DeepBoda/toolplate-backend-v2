const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    toolId: Joi.number().required(),
    newsId: Joi.number().allow(null),
  }),
  update: Joi.object().keys({
    toolId: Joi.number(),
    newsId: Joi.number().allow(null),
  }),
};
