const createError = require("http-errors");

exports.joiValidator =
  (schema, source = "body") =>
  (req, res, next) => {
    let data;

    // Choose the data source (body, params, or query)
    switch (source) {
      case "body":
        data = req.body;
        break;
      case "params":
        data = req.params;
        break;
      case "query":
        data = req.query;
        break;
      default:
        data = req.body; // Default to body
    }

    const options = {
      errors: {
        wrap: {
          label: "",
        },
      },
    };

    const result = schema.validate(data, options);
    if (result.error) {
      const errorMessage = result.error.details[0].message;
      const field = result.error.details[0].context.key;
      const error = new createError.UnprocessableEntity(
        `Validation failed for ${field}: ${errorMessage}`
      );
      return next(error);
    }

    next();
  };
