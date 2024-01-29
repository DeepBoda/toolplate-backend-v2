const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    country: Joi.string().required(),
    title: Joi.string().required(),
    link: Joi.string().required(),
    message: Joi.string().required(),
    status: Joi.string().valid("Pending", "OnGoing", "Approved", "Denied"),
    mainCategoryId: Joi.number().required(),
  }),
  update: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
    country: Joi.string(),
    title: Joi.string(),
    link: Joi.string(),
    message: Joi.string(),
    status: Joi.string().valid("Pending", "OnGoing", "Approved", "Denied"),
    mainCategoryId: Joi.number(),
  }),
};
