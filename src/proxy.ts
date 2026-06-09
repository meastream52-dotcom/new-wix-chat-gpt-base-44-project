import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/agents/:path*",
    "/crm/:path*",
    "/appointments/:path*",
    "/workflows/:path*",
    "/documents/:path*",
    "/training/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
