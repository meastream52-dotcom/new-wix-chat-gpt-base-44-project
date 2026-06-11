import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";

const schema = z.object({
  entryIds: z.array(z.string()).min(1).max(1000),
  reason: z.string().min(3).max(500),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { entryIds, reason } = parsed.data;

    const entries = await prisma.ledgerEntry.findMany({
      where: { id: { in: entryIds }, status: { in: ["pending", "approved"] } },
    });

    await prisma.$transaction([
      prisma.ledgerEntry.updateMany({
        where: { id: { in: entries.map((e) => e.id) } },
        data: { status: "held_for_review", reviewNote: reason },
      }),
    ]);

    for (const entry of entries) {
      await logAudit(admin.id, "ledger.hold", "ledger_entry", entry.id, {
        userId: entry.userId,
        reason,
      });
    }
    for (const userId of new Set(entries.map((e) => e.userId))) {
      await notify(
        userId,
        "payout_held",
        "Some of your earnings are being reviewed. No action is needed from you.",
        "/dashboard/earnings"
      );
    }

    return Response.json({ ok: true, held: entries.length });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
