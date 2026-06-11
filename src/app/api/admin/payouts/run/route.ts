import { z } from "zod";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { runPayouts } from "@/lib/payouts/run";

const schema = z.object({ periodId: z.string().optional() });

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await runPayouts(admin.id, parsed.data.periodId);
    return Response.json({
      batchId: result.batchId,
      status: result.status,
      paid: result.paid.map((p) => ({ ...p, amountCents: p.amountCents.toString() })),
      failed: result.failed.map((f) => ({ ...f, amountCents: f.amountCents.toString() })),
      skipped: result.skipped.map((s) => ({ ...s, totalCents: s.totalCents.toString() })),
    });
  } catch (err) {
    const authResp = authErrorResponse(err);
    if (authResp) return authResp;
    return Response.json(
      { error: err instanceof Error ? err.message : "Payout run failed" },
      { status: 500 }
    );
  }
}
