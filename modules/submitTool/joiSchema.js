const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    country: Joi.string().required(),
    logo: Joi.string(),
    title: Joi.string().required(),
    link: Joi.string().required(),
    video: Joi.string().allow(null),
    previews: Joi.string(),
    overview: Joi.string().allow(null),
    message: Joi.string().allow(null),
    status: Joi.string().valid("Pending", "OnGoing", "Approved", "Denied"),
    categories: Joi.string().required(),
  }),
  update: Joi.object().keys({
    toolId: Joi.number(),
    reason: Joi.string(),
    status: Joi.string().valid("Pending", "OnGoing", "Approved", "Denied"),
  }),
};
