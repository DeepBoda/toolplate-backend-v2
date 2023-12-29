const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    blogId: Joi.number().required(),
    categoryOfBlogId: Joi.number().required(),
  }),
  update: Joi.object().keys({
    blogId: Joi.number(),
    categoryOfBlogId: Joi.number(),
  }),
};
