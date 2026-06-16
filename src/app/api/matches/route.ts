import { defineRoute, jsonOk, parseJson, parseQuery } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/auth";
import { matchService } from "@/server/services/match.service";
import { generateMatchesSchema, listMatchesQuerySchema } from "@/validators/match";

export const runtime = "nodejs";

// Generate opportunity matches for the current athlete.
export const POST = defineRoute(
  async (req) => {
    const ctx = await requireRole("athlete", "admin");
    const input = await parseJson(req, generateMatchesSchema);
    return jsonOk(await matchService.generateMatches(ctx, input));
  },
  { rateLimit: "heavy" }
);

// Get the current athlete's ranked school matches.
export const GET = defineRoute(
  async (req) => {
    const ctx = await requireAuth();
    const { sport_id, min_score, tier, limit, offset } = parseQuery(
      req,
      listMatchesQuerySchema
    );
    const matches = await matchService.listMatches(ctx, {
      sportId: sport_id,
      minScore: min_score,
      tier,
      limit,
      offset,
    });
    return jsonOk(matches);
  },
  { rateLimit: "read" }
);
