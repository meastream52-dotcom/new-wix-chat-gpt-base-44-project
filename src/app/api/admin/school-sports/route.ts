import { defineRoute, jsonOk, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { schoolService } from "@/server/services/school.service";
import { createSchoolSportSchema } from "@/validators/school";

export const runtime = "nodejs";

export const POST = defineRoute(
  async (req) => {
    const ctx = await requireRole("admin");
    const input = await parseJson(req, createSchoolSportSchema);
    return jsonOk(await schoolService.createSport(ctx, input), 201);
  },
  { rateLimit: "write" }
);
