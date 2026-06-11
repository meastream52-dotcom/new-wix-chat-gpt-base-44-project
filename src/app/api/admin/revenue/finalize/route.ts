import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const schema = z.object({ periodId: z.string() });

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const pending = await prisma.ledgerEntry.count({
      where: { revenuePeriodId: parsed.data.periodId, status: "pending" },
    });
    if (pending > 0) {
      return Response.json(
        { error: `${pending} entries are still pending — approve or hold them first` },
        { status: 409 }
      );
    }

    const period = await prisma.revenuePeriod.update({
      where: { id: parsed.data.periodId },
      data: { status: "finalized", finalizedAt: new Date() },
    });
    await logAudit(admin.id, "revenue.finalize", "revenue_period", period.id);
    return Response.json({ ok: true, status: period.status });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
