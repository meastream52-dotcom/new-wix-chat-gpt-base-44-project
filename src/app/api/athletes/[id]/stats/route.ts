import { defineRoute, jsonOk, parseJson, parseQuery } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { statsService } from "@/server/services/stats.service";
import { addStatsSchema, listStatsQuerySchema } from "@/validators/stats";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

// Add one or more stats for the athlete.
export const POST = defineRoute<Ctx>(
  async (req, { params }) => {
    const ctx = await requireAuth();
    const { id } = await params;
    const stats = await parseJson(req, addStatsSchema);
    const created = await statsService.addStats(ctx, id, stats);
    return jsonOk(created, 201);
  },
  { rateLimit: "write" }
);

// List the athlete's stats (optionally filtered by sport / metric).
export const GET = defineRoute<Ctx>(
  async (req, { params }) => {
    const ctx = await requireAuth();
    const { id } = await params;
    const { sport_id, metric_key } = parseQuery(req, listStatsQuerySchema);
    const stats = await statsService.listStats(ctx, id, {
      sportId: sport_id,
      metricKey: metric_key,
    });
    return jsonOk(stats);
  },
  { rateLimit: "read" }
);
