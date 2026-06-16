/**
 * Typed application errors + a single HTTP error serializer.
 *
 * Services and repositories throw these; the API handler (lib/api.ts) maps them
 * to consistent JSON responses. Unknown errors become a safe 500.
 */
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UNPROCESSABLE"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(message: string, statusCode: number, code: ErrorCode, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}
export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource") {
    super(message, 403, "FORBIDDEN");
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}
export class ConflictError extends AppError {
  constructor(message = "Resource already exists", details?: unknown) {
    super(message, 409, "CONFLICT", details);
  }
}
export class RateLimitError extends AppError {
  readonly retryAfterSeconds: number;
  constructor(retryAfterSeconds: number, message = "Too many requests") {
    super(message, 429, "RATE_LIMITED");
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
export class UnprocessableError extends AppError {
  constructor(message = "Request could not be processed", details?: unknown) {
    super(message, 422, "UNPROCESSABLE", details);
  }
}

/** Map a Postgres/PostgREST error code to a typed AppError where meaningful. */
export function fromPostgrest(error: { code?: string; message: string; details?: string }): AppError {
  switch (error.code) {
    case "23505": // unique_violation
      return new ConflictError("A record with these values already exists", error.details);
    case "23503": // foreign_key_violation
      return new UnprocessableError("Referenced record does not exist", error.details);
    case "23514": // check_violation
      return new ValidationError("A value violates a database constraint", error.details);
    case "42501": // insufficient_privilege (RLS)
      return new ForbiddenError("You do not have access to this resource");
    case "PGRST116": // no rows for .single()
      return new NotFoundError();
    default:
      return new AppError(error.message || "Database error", 500, "INTERNAL_ERROR");
  }
}

interface ErrorBody {
  error: { code: ErrorCode; message: string; details?: unknown };
}

/** Serialize any thrown value into a consistent JSON error response. */
export function toErrorResponse(err: unknown): NextResponse<ErrorBody> {
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Validation failed", details } },
      { status: 400 }
    );
  }

  if (err instanceof AppError) {
    const headers: Record<string, string> = {};
    if (err instanceof RateLimitError) headers["Retry-After"] = String(err.retryAfterSeconds);
    return NextResponse.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      { status: err.statusCode, headers }
    );
  }

  // Never leak internal error details to clients.
  if (process.env.NODE_ENV !== "production") {
    console.error("Unhandled API error:", err);
  }
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    { status: 500 }
  );
}
