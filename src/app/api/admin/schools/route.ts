import { defineRoute, jsonOk, parseJson, parseQuery } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { schoolService } from "@/server/services/school.service";
import { createSchoolSchema, listSchoolsQuerySchema } from "@/validators/school";

export const runtime = "nodejs";

export const GET = defineRoute(
  async (req) => {
    const ctx = await requireRole("admin");
    const { q, association, state, limit, offset } = parseQuery(req, listSchoolsQuerySchema);
    const { rows, total } = await schoolService.list(ctx, {
      q,
      association,
      state,
      limit,
      offset,
    });
    return jsonOk(rows, { headers: { "X-Total-Count": String(total) } });
  },
  { rateLimit: "read" }
);

export const POST = defineRoute(
  async (req) => {
    const ctx = await requireRole("admin");
    const input = await parseJson(req, createSchoolSchema);
    return jsonOk(await schoolService.create(ctx, input), 201);
  },
  { rateLimit: "write" }
);
