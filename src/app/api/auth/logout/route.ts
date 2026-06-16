import { defineRoute, jsonOk } from "@/lib/api";
import { authService } from "@/server/services/auth.service";

export const runtime = "nodejs";

export const POST = defineRoute(
  async () => {
    await authService.signOut();
    return jsonOk({ success: true });
  },
  { rateLimit: "auth" }
);
