import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { closeSession } from "@/lib/engagement/closeSession";

/**
 * Final beacon from the client on pagehide. Accepts sendBeacon payloads
 * (text/plain or application/json) — parse the raw body manually.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  let sessionId: string | undefined;
  try {
    const body = JSON.parse(await req.text());
    sessionId = typeof body?.sessionId === "string" ? body.sessionId : undefined;
  } catch {
    return Response.json({ ok: true });
  }
  if (!sessionId) return Response.json({ ok: true });

  const session = await prisma.readingSession.findUnique({ where: { id: sessionId } });
  if (session && session.userId === user.id) {
    await closeSession(session.id);
  }
  return Response.json({ ok: true });
}
