const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    topOverview: Joi.string(),
    bottomOverview: Joi.string(),
  }),
  update: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    topOverview: Joi.string(),
    bottomOverview: Joi.string(),
  }),
};
