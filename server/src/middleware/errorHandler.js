/**
 * errorHandler.js
 * Global Express error-handling middleware.
 *
 * Normalizes all error formats (Mongoose validation, Mongoose Cast,
 * Zod validation, JWT, CSRF, or custom) into a single, unified client response:
 *
 * {
 *   success: false,
 *   message: "Error summary string",
 *   errors: [
 *     { field: "email", message: "Invalid format" }
 *   ]
 * }
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message    = err.message || "Internal Server Error";
  let errors     = [];

  // 1. Zod schema validation errors (coerced format)
  if (err.name === "ZodError" || err.errors && Array.isArray(err.errors) && err.errors[0]?.path) {
    statusCode = 422;
    message    = "Validation failed. Please check your inputs.";
    errors     = err.errors.map((e) => ({
      field:   Array.isArray(e.path) ? e.path.join(".") : e.field || "unknown",
      message: e.message,
    }));
  }
  // 2. Mongoose schema validation errors
  else if (err.name === "ValidationError") {
    statusCode = 422;
    message    = "Database validation failed.";
    errors     = Object.keys(err.errors).map((key) => ({
      field:   key,
      message: err.errors[key].message,
    }));
  }
  // 3. Mongoose Cast Error (e.g. invalid ObjectId format)
  else if (err.name === "CastError") {
    statusCode = 400;
    message    = `Invalid format for field "${err.path}".`;
    errors     = [{
      field:   err.path,
      message: `Value "${err.value}" is not a valid ${err.kind || "ObjectId"}.`,
    }];
  }
  // 4. Duplicate Key Error (MongoDB code 11000)
  else if (err.code === 11000) {
    statusCode = 409;
    if (err.keyPattern?.name && err.keyPattern?.description) {
      message = "A product with the same name and description already exists.";
      errors = [{
        field: "name",
        message: "Choose a different name or description for this product.",
      }];
    } else {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message    = `Duplicate entry: That ${field} is already in use.`;
    errors     = [{
      field,
      message: `This ${field} is already registered.`,
    }];
    }
  }
  // 5. JWT or Session Expired Errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message    = "Invalid authentication token. Please log in again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message    = "Your session has expired. Please log in again.";
  }

  const isDev = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    success: false,
    message,
    errors:  errors.length > 0 ? errors : undefined,
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
