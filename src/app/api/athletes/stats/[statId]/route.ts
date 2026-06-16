import { defineRoute, jsonOk, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { statsService } from "@/server/services/stats.service";
import { updateStatSchema } from "@/validators/stats";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ statId: string }> };

export const PATCH = defineRoute<Ctx>(
  async (req, { params }) => {
    const ctx = await requireAuth();
    const { statId } = await params;
    const patch = await parseJson(req, updateStatSchema);
    return jsonOk(await statsService.updateStat(ctx, statId, patch));
  },
  { rateLimit: "write" }
);
