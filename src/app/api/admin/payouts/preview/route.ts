import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { previewPayouts } from "@/lib/payouts/run";

/** Dry run — exactly the selection the run endpoint would pay. */
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const periodId = new URL(req.url).searchParams.get("periodId") ?? undefined;
    const preview = await previewPayouts(periodId);
    return Response.json({
      minimumPayoutCents: preview.minimumPayoutCents,
      totalCents: preview.totalCents.toString(),
      eligible: preview.eligible.map((g) => ({
        userId: g.userId,
        username: g.username,
        entryCount: g.entryIds.length,
        totalCents: g.totalCents.toString(),
      })),
      skipped: preview.skipped.map((s) => ({
        ...s,
        totalCents: s.totalCents.toString(),
      })),
    });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
