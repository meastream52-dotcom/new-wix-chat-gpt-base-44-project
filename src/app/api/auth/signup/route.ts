import { defineRoute, jsonOk, parseJson } from "@/lib/api";
import { authService } from "@/server/services/auth.service";
import { signupSchema } from "@/validators/auth";

export const runtime = "nodejs";

export const POST = defineRoute(
  async (req) => {
    const input = await parseJson(req, signupSchema);
    const { user, session } = await authService.signUp(input);
    return jsonOk({ user, session }, 201);
  },
  { rateLimit: "auth" }
);
