/**
 * errorHandler.js
 * Global Express error-handling middleware.
 *
 * Must be registered LAST with app.use() — after all routes.
 * Express recognises it as an error handler because it has 4 parameters.
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Determine status code: use the one already set on the response,
  // or fall back to 500 if the response still has the default 200.
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  const isDev = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only expose the stack trace in development
    ...(isDev && { stack: err.stack }),
    // Surface Mongoose validation errors in a friendly format
    ...(err.name === "ValidationError" && {
      errors: Object.values(err.errors).map((e) => e.message),
    }),
    // Surface Mongoose CastError (invalid ObjectId, etc.)
    ...(err.name === "CastError" && {
      field: err.path,
      value: err.value,
    }),
  });
};

module.exports = errorHandler;
