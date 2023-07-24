const createError = require("http-errors");

exports.joiValidator = (schema) => (req, res, next) => {
  const options = {
    errors: {
      wrap: {
        label: "",
      },
    },
  };
  const result = schema.validate(req.body, options);
  if (result.error)
    return next(createError(422, result.error.details[0].message));
  next();
};
