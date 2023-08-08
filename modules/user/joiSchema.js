const Joi = require("joi");

module.exports = {
  signup: Joi.object().keys({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    uid: Joi.string(),
    profilePic: Joi.string(),
    FCM: Joi.string(),
  }),
  updateProfile: Joi.object().keys({
    username: Joi.string(),
    // email: Joi.string().email(),
    // password: Joi.string(),
    uid: Joi.string(),
    profilePic: Joi.string(),
    isBlocked: Joi.boolean(),
    FCM: Joi.string(),
  }),
};
