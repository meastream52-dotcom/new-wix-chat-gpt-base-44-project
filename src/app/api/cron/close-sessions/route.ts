import { prisma } from "@/lib/prisma";
import { isAuthorizedCron } from "@/lib/cron";
import { closeSession } from "@/lib/engagement/closeSession";
import { SESSION_IDLE_TIMEOUT_SECONDS } from "@/lib/engagement/constants";

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return new Response("Unauthorized", { status: 401 });

  const cutoff = new Date(Date.now() - SESSION_IDLE_TIMEOUT_SECONDS * 1000);
  let closed = 0;

  // Batches of 100 until done (bounded to keep the invocation short)
  for (let batch = 0; batch < 20; batch++) {
    const stale = await prisma.readingSession.findMany({
      where: { closedAt: null, lastHeartbeatAt: { lt: cutoff } },
      select: { id: true },
      take: 100,
    });
    if (stale.length === 0) break;
    for (const { id } of stale) {
      if (await closeSession(id)) closed++;
    }
    if (stale.length < 100) break;
  }

  return Response.json({ ok: true, closed });
}
