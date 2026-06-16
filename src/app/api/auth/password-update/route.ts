import { defineRoute, jsonOk, parseJson } from "@/lib/api";
import { authService } from "@/server/services/auth.service";
import { passwordUpdateSchema } from "@/validators/auth";

export const runtime = "nodejs";

/** Set a new password using the active (recovery) session from the reset link. */
export const POST = defineRoute(
  async (req) => {
    const input = await parseJson(req, passwordUpdateSchema);
    await authService.updatePassword(input.password);
    return jsonOk({ success: true });
  },
  { rateLimit: "auth" }
);
