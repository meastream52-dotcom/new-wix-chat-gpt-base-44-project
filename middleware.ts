import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Auth.js v5 middleware: wraps the handler with the session from the JWT cookie.
// `req.auth` is null when unauthenticated, a Session object when authenticated.
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthPage = ["/login", "/signup", "/forgot-password", "/reset-password"].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  // Unauthenticated user hitting a dashboard route → send to login.
  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);  // preserve destination
    return NextResponse.redirect(loginUrl);
  }

  // Already logged-in user hitting an auth page → send to dashboard.
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

// Run on every route EXCEPT Next.js internals and static files.
// The api/auth segment is excluded so Auth.js's own endpoints are never blocked.
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
