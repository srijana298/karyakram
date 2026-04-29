import { Result, ApiResponse } from "./ApiResponse.js";

/**
 * Wraps an async controller. Inspects the returned Result:
 *   - Ok   → sends success response
 *   - Err  → sends error response
 *   - catch-all → sends 500 (should never happen if controllers behave)
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .then((result) => {
      if (result instanceof Result) {
        result.value.send(res);
      }
    })
    .catch((err) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[ERROR] ${req.method} ${req.path}:`, err);
      new ApiResponse(500, null, message).send(res);
    });
};
