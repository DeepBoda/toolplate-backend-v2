const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    topic: Joi.string(),
    click_action: Joi.string(),
    AdminId: Joi.number(),
    schedule: Joi.date(),
  }),
  update: Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    topic: Joi.string(),
    click_action: Joi.string(),
    AdminId: Joi.number(),
  }),
};
