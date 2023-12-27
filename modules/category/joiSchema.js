const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    mainCategoryId: Joi.number().required(),
  }),
  update: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    mainCategoryId: Joi.number(),
  }),
};
