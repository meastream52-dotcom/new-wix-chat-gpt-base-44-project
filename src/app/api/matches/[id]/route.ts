import { defineRoute, jsonOk } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { matchService } from "@/server/services/match.service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const GET = defineRoute<Ctx>(
  async (_req, { params }) => {
    const ctx = await requireAuth();
    const { id } = await params;
    return jsonOk(await matchService.getMatchDetail(ctx, id));
  },
  { rateLimit: "read" }
);
