const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    company: Joi.string().required(),
    toolName: Joi.string().required(),
    email: Joi.string().email().required(),
    status: Joi.string().valid(
      "Initial",
      "FollowUp1",
      "FollowUp2",
      "FollowUp3",
      "Featured",
      "Rejected"
    ),
  }),
  update: Joi.object().keys({
    toolId: Joi.number(),
    reason: Joi.string(),
    status: Joi.string().valid(
      "Initial",
      "FollowUp1",
      "FollowUp2",
      "FollowUp3",
      "Featured",
      "Rejected"
    ),
  }),
};
