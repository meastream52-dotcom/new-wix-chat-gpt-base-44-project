import { z } from "zod";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { calculatePeriod } from "@/lib/revenue/calculatePeriod";

const schema = z.object({
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
});

/**
 * Month-end close is a deliberate human action — no cron triggers this.
 * Idempotent: re-running a non-failed period returns it untouched.
 */
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { periodStart, periodEnd } = parsed.data;
    if (periodEnd <= periodStart) {
      return Response.json({ error: "periodEnd must be after periodStart" }, { status: 400 });
    }

    const period = await calculatePeriod(periodStart, periodEnd);
    await logAudit(admin.id, "revenue.calculate", "revenue_period", period.id, {
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      status: period.status,
    });

    return Response.json({
      ...period,
      totalRevenueCents: period.totalRevenueCents.toString(),
      ownerPoolCents: period.ownerPoolCents.toString(),
      writerPoolCents: period.writerPoolCents.toString(),
      userPoolCents: period.userPoolCents.toString(),
    });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
