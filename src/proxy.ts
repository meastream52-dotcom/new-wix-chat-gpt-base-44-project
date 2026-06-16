import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js Proxy (formerly "middleware"): refreshes the Supabase session on
 * every AOE request and enforces authentication / admin access at the edge as
 * a first line of defense (route handlers re-check via requireAuth/requireRole).
 */
const PROTECTED_PREFIXES = ["/api/athletes", "/api/matches", "/api/admin"];
const ADMIN_PREFIXES = ["/api/admin"];

function jsonError(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !user) {
    return jsonError("UNAUTHORIZED", "Authentication required", 401);
  }

  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p)) && user) {
    const role = user.app_metadata?.role as string | undefined;
    if (role !== "admin") {
      return jsonError("FORBIDDEN", "Admin access required", 403);
    }
  }

  return response;
}

// Scope to AOE API routes only (keeps the existing app unaffected).
export const config = {
  matcher: [
    "/api/auth/:path*",
    "/api/athletes/:path*",
    "/api/matches/:path*",
    "/api/admin/:path*",
  ],
};
