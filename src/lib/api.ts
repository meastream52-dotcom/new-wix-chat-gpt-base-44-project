/**
 * Route-handler plumbing: a wrapper that applies rate limiting and uniform
 * error serialization, plus typed body/query parsers.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z, type ZodTypeAny } from "zod";
import { toErrorResponse, ValidationError } from "./errors";
import { enforceRateLimit, type RateLimitTier } from "./rate-limit";
import { getClientIp } from "./auth";

export interface RouteConfig {
  /** Apply a rate-limit tier keyed by client IP before running the handler. */
  rateLimit?: RateLimitTier;
}

type Handler<Ctx> = (req: NextRequest, ctx: Ctx) => Promise<NextResponse> | NextResponse;

/**
 * Wrap a route handler with cross-cutting concerns. Any thrown AppError /
 * ZodError / unknown error is converted to a consistent JSON response.
 */
export function defineRoute<Ctx = unknown>(handler: Handler<Ctx>, config: RouteConfig = {}) {
  return async (req: NextRequest, ctx: Ctx): Promise<NextResponse> => {
    try {
      if (config.rateLimit) {
        await enforceRateLimit(config.rateLimit, getClientIp(req));
      }
      return await handler(req, ctx);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

/** Standard success envelope: `{ data: ... }`. */
export function jsonOk<T>(data: T, init?: number | ResponseInit): NextResponse {
  const responseInit = typeof init === "number" ? { status: init } : init;
  return NextResponse.json({ data }, responseInit);
}

/** Parse + validate a JSON request body. Throws ValidationError on bad JSON. */
export async function parseJson<T extends ZodTypeAny>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }
  return schema.parse(raw);
}

/** Parse + validate URL query string parameters. */
export function parseQuery<T extends ZodTypeAny>(req: NextRequest, schema: T): z.infer<T> {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  return schema.parse(params);
}
