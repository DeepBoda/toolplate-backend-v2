const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    company: Joi.string().required(),
    tool: Joi.string().required(),
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
