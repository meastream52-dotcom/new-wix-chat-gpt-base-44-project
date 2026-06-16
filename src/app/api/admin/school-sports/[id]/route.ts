import { defineRoute, jsonOk, parseJson } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { schoolService } from "@/server/services/school.service";
import { updateSchoolSportSchema } from "@/validators/school";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = defineRoute<Ctx>(
  async (req, { params }) => {
    const ctx = await requireRole("admin");
    const { id } = await params;
    const patch = await parseJson(req, updateSchoolSportSchema);
    return jsonOk(await schoolService.updateSport(ctx, id, patch));
  },
  { rateLimit: "write" }
);

export const DELETE = defineRoute<Ctx>(
  async (_req, { params }) => {
    const ctx = await requireRole("admin");
    const { id } = await params;
    await schoolService.removeSport(ctx, id);
    return jsonOk({ success: true });
  },
  { rateLimit: "write" }
);
