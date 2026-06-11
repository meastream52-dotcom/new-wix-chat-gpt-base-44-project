import { subDays } from "date-fns";
import { isAuthorizedCron } from "@/lib/cron";
import { runFraudScan } from "@/lib/fraud/scan";

/** Nightly: run all fraud rules on the trailing 7 days. Flags only — humans decide. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return new Response("Unauthorized", { status: 401 });

  const windowEnd = new Date();
  const windowStart = subDays(windowEnd, 7);
  const result = await runFraudScan(windowStart, windowEnd);
  return Response.json({ ok: true, ...result });
}
