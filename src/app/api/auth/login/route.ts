import { defineRoute, jsonOk, parseJson } from "@/lib/api";
import { authService } from "@/server/services/auth.service";
import { loginSchema } from "@/validators/auth";

export const runtime = "nodejs";

export const POST = defineRoute(
  async (req) => {
    const input = await parseJson(req, loginSchema);
    const { user, session } = await authService.signIn(input);
    return jsonOk({ user, session });
  },
  { rateLimit: "auth" }
);
