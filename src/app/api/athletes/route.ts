import { defineRoute, jsonOk, parseJson } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { athleteService } from "@/server/services/athlete.service";
import { createAthleteProfileSchema } from "@/validators/athlete";

export const runtime = "nodejs";

// Create the current user's athlete profile.
export const POST = defineRoute(
  async (req) => {
    const ctx = await requireRole("athlete", "admin");
    const input = await parseJson(req, createAthleteProfileSchema);
    const profile = await athleteService.createProfile(ctx, input);
    return jsonOk(profile, 201);
  },
  { rateLimit: "write" }
);

// Get the current user's own athlete profile.
export const GET = defineRoute(
  async () => {
    const ctx = await requireAuth();
    const profile = await athleteService.getOwnProfile(ctx);
    return jsonOk(profile);
  },
  { rateLimit: "read" }
);
