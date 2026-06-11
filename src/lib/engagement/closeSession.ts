import { prisma } from "@/lib/prisma";
import { trackEngagement } from "@/lib/engagement/track";
import {
  MIN_QUALIFIED_SECONDS,
  READ_POINTS_PER_MINUTE,
} from "@/lib/engagement/constants";

/**
 * Close a reading session and, if it qualifies, emit its one-and-only
 * read_session_completed event. Idempotent: the closedAt guard in the
 * updateMany means a session can never produce a second event.
 */
export async function closeSession(sessionId: string): Promise<boolean> {
  // Atomic claim — only the caller that flips closedAt emits the event
  const claimed = await prisma.readingSession.updateMany({
    where: { id: sessionId, closedAt: null },
    data: { closedAt: new Date() },
  });
  if (claimed.count === 0) return false;

  const session = await prisma.readingSession.findUnique({
    where: { id: sessionId },
    include: { post: { select: { authorId: true } } },
  });
  if (!session) return false;

  const qualifies =
    !session.isSuspicious &&
    session.qualifiedSeconds >= MIN_QUALIFIED_SECONDS &&
    session.post.authorId !== session.userId;
  if (!qualifies) return true;

  const points = Math.floor((session.qualifiedSeconds / 60) * READ_POINTS_PER_MINUTE);
  await trackEngagement(
    session.userId,
    "read_session_completed",
    session.postId,
    points,
    undefined,
    { sessionId: session.id, postId: session.postId, qualifiedSeconds: session.qualifiedSeconds }
  );
  return true;
}

export async function getDailyQualifiedSeconds(
  userId: string,
  postId: string,
  now: Date = new Date()
): Promise<number> {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const result = await prisma.readingSession.aggregate({
    where: { userId, postId, startedAt: { gte: dayStart } },
    _sum: { qualifiedSeconds: true },
  });
  return result._sum.qualifiedSeconds ?? 0;
}
