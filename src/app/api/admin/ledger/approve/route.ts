import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { dollars } from "@/lib/format";

const schema = z.object({ entryIds: z.array(z.string()).min(1).max(1000) });

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const entries = await prisma.ledgerEntry.findMany({
      where: {
        id: { in: parsed.data.entryIds },
        status: { in: ["pending", "held_for_review"] },
      },
    });

    await prisma.$transaction([
      prisma.ledgerEntry.updateMany({
        where: { id: { in: entries.map((e) => e.id) } },
        data: { status: "approved", reviewNote: null },
      }),
    ]);

    for (const entry of entries) {
      await logAudit(admin.id, "ledger.approve", "ledger_entry", entry.id, {
        userId: entry.userId,
        amountCents: entry.amountCents.toString(),
      });
    }
    // One notification per user, not per entry
    const byUser = new Map<string, bigint>();
    for (const entry of entries) {
      byUser.set(entry.userId, (byUser.get(entry.userId) ?? 0n) + entry.amountCents);
    }
    for (const [userId, total] of byUser) {
      await notify(
        userId,
        "entry_approved",
        `Earnings of ${dollars(total)} were approved and will be included in the next payout.`,
        "/dashboard/earnings"
      );
    }

    return Response.json({ ok: true, approved: entries.length });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
