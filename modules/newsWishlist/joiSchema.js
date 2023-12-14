const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    newsId: Joi.number().required(),
  }),
  update: Joi.object().keys({
    newsId: Joi.number(),
  }),
};
