import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hashIp, hashUa } from "@/lib/hash";
import { rateLimit } from "@/lib/ratelimit";
import { closeSession, getDailyQualifiedSeconds } from "@/lib/engagement/closeSession";
import {
  HEARTBEAT_INTERVAL_SECONDS,
  MAX_DAILY_QUALIFIED_SECONDS_PER_POST,
  SESSION_IDLE_TIMEOUT_SECONDS,
} from "@/lib/engagement/constants";

const schema = z.object({
  postId: z.string(),
  sessionId: z.string().optional(),
  maxScrollPct: z.number().min(0).max(100).optional(),
});

const ok = (sessionId?: string) =>
  Response.json(sessionId ? { ok: true, sessionId } : { ok: true });

/**
 * Heartbeats are deliberately quiet: invalid posts, self-reads, and
 * too-fast calls all return { ok: true } so probers learn nothing.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  if (!(await rateLimit(`hb:${user.id}`, 30, 60))) return ok();

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return ok();
  const { postId, sessionId, maxScrollPct } = parsed.data;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.status !== "PUBLISHED" || post.visibility !== "PUBLIC") return ok();

  // Self-reads never count — no session at all
  if (post.authorId === user.id) return ok();

  const startSession = async () => {
    const created = await prisma.readingSession.create({
      data: {
        userId: user.id,
        postId,
        maxScrollPct: Math.floor(maxScrollPct ?? 0),
        ipHash: hashIp(req),
        userAgentHash: hashUa(req),
      },
    });
    return ok(created.id);
  };

  if (!sessionId) return startSession();

  const session = await prisma.readingSession.findUnique({ where: { id: sessionId } });
  // Must belong to this user AND this post, else start fresh
  if (!session || session.userId !== user.id || session.postId !== postId || session.closedAt) {
    return startSession();
  }

  const elapsedSeconds = (Date.now() - session.lastHeartbeatAt.getTime()) / 1000;

  // Anti-spam: scripted rapid-fire heartbeats don't increment
  if (elapsedSeconds < HEARTBEAT_INTERVAL_SECONDS * 0.8) return ok(session.id);

  // Stale: tab came back after idle timeout — close the old session, start anew
  if (elapsedSeconds > SESSION_IDLE_TIMEOUT_SECONDS) {
    await closeSession(session.id);
    return startSession();
  }

  const dailyTotal = await getDailyQualifiedSeconds(user.id, postId);
  const qualifiedIncrement = Math.min(
    HEARTBEAT_INTERVAL_SECONDS,
    Math.max(0, MAX_DAILY_QUALIFIED_SECONDS_PER_POST - dailyTotal)
  );

  await prisma.readingSession.update({
    where: { id: session.id },
    data: {
      lastHeartbeatAt: new Date(),
      totalSeconds: { increment: HEARTBEAT_INTERVAL_SECONDS },
      qualifiedSeconds: { increment: qualifiedIncrement },
      maxScrollPct: Math.max(session.maxScrollPct, Math.floor(maxScrollPct ?? 0)),
    },
  });

  return ok(session.id);
}
