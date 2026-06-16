import { defineRoute, jsonOk, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { athleteService } from "@/server/services/athlete.service";
import { updateAthleteProfileSchema } from "@/validators/athlete";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const GET = defineRoute<Ctx>(
  async (_req, { params }) => {
    const ctx = await requireAuth();
    const { id } = await params;
    return jsonOk(await athleteService.getProfile(ctx, id));
  },
  { rateLimit: "read" }
);

export const PATCH = defineRoute<Ctx>(
  async (req, { params }) => {
    const ctx = await requireAuth();
    const { id } = await params;
    const patch = await parseJson(req, updateAthleteProfileSchema);
    return jsonOk(await athleteService.updateProfile(ctx, id, patch));
  },
  { rateLimit: "write" }
);
