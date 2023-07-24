const Joi = require("joi");

module.exports = {
  signup: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    mobile: Joi.number().min(1000000000).max(9999999999).required(),
    dob: Joi.date().less("now").required(),
    profilePic: Joi.string(),
  }),
  updateProfile: Joi.object().keys({
    name: Joi.string(),
    profilePic: Joi.string(),
    dob: Joi.date().less("now"),
    email: Joi.string().email(),
  }),
};
