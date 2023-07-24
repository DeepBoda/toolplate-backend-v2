const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    appInMaintenance: Joi.boolean().default(false),
    androidVersionCode: Joi.string().default("1.0.0"),
    iosVersionCode: Joi.string().default("1.0.0"),
    forceUpdate: Joi.boolean().default(false),
    softUpdate: Joi.boolean().default(false),
  }),
  update: Joi.object().keys({
    appInMaintenance: Joi.boolean(),
    androidVersionCode: Joi.string(),
    iosVersionCode: Joi.string(),
    forceUpdate: Joi.boolean(),
    softUpdate: Joi.boolean(),
  }),
};
