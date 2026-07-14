/**
 * validate.js
 * Generic Zod validation middleware factory.
 *
 * Usage:
 *   router.post("/register", validate(schemas.register), register);
 *
 * On a validation error it returns a structured 422 response with all
 * field-level errors so the client can display them inline on forms.
 */

const { ZodError } = require("zod");

/**
 * @param {import('zod').ZodSchema} schema  The Zod schema to validate against.
 * @param {"body"|"query"|"params"} target  Which part of the request to validate (default: "body").
 */
const validate = (schema, target = "body") => (req, res, next) => {
  const result = schema.safeParse(req[target]);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field:   e.path.join("."),
      message: e.message,
    }));

    return res.status(422).json({
      success: false,
      message: "Validation failed. Please check your input.",
      errors,
    });
  }

  // Replace the raw input with the parsed (coerced + sanitised) output
  req[target] = result.data;
  next();
};

module.exports = { validate };
