import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Validates req.body against a Zod schema.
 * Parsed data replaces req.body so controllers get clean values.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const first = Object.values(errors).flat()[0] || "Validation failed";
    return new ApiResponse(400, errors, first).send(res);
  }
  req.body = result.data;
  next();
};

/**
 * Validates req.query against a Zod schema.
 */
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const first = Object.values(errors).flat()[0] || "Validation failed";
    return new ApiResponse(400, errors, first).send(res);
  }
  req.query = result.data;
  next();
};
