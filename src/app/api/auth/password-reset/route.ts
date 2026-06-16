import { defineRoute, jsonOk, parseJson } from "@/lib/api";
import { authService } from "@/server/services/auth.service";
import { passwordResetRequestSchema } from "@/validators/auth";

export const runtime = "nodejs";

/** Request a password-reset email. Always returns 200 (no account enumeration). */
export const POST = defineRoute(
  async (req) => {
    const input = await parseJson(req, passwordResetRequestSchema);
    await authService.requestPasswordReset(input.email, input.redirect_to);
    return jsonOk({ message: "If an account exists, a reset link has been sent." });
  },
  { rateLimit: "auth" }
);
