/**
 * ApiResponse — knows how to send itself as an HTTP response.
 * Used internally by Result. Also used by middleware for direct sends.
 */
class ApiResponse {
  constructor(statusCode, data, message) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 300;
  }

  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

/**
 * Result — Rust-like discriminated union.
 * Controllers return Result values. asyncHandler inspects and sends.
 */
class Result {
  /** @type {boolean} */
  ok;
  /** @type {ApiResponse} */
  value;

  constructor(ok, value) {
    this.ok = ok;
    this.value = value;
  }
}

// ── Success constructors ─────────────────────────────────────────────

export const Ok = (data, message = "Success") =>
  new Result(true, new ApiResponse(200, data, message));

export const Created = (data, message = "Created") =>
  new Result(true, new ApiResponse(201, data, message));

export const NoContent = (message = "No Content") =>
  new Result(true, new ApiResponse(204, null, message));

// ── Error constructors ───────────────────────────────────────────────

export const BadRequest = (message = "Bad Request", data = null) =>
  new Result(false, new ApiResponse(400, data, message));

export const Unauthorized = (message = "Unauthorized") =>
  new Result(false, new ApiResponse(401, null, message));

export const Forbidden = (message = "Forbidden") =>
  new Result(false, new ApiResponse(403, null, message));

export const NotFound = (message = "Not Found") =>
  new Result(false, new ApiResponse(404, null, message));

export const Conflict = (message = "Conflict") =>
  new Result(false, new ApiResponse(409, null, message));

export const InternalError = (message = "Internal Server Error") =>
  new Result(false, new ApiResponse(500, null, message));

export { ApiResponse, Result };
