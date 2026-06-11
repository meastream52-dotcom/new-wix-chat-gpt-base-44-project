import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isNearDuplicate } from "@/lib/moderation/spam";
import type { FraudRule, SignalCandidate } from "@/lib/fraud/types";

const SAMPLE_PER_USER = 30;

/**
 * 3+ near-identical comments across different posts within 24h. Exact
 * duplicates are caught by contentHash grouping; near-duplicates by a
 * sampled Levenshtein pass over each flagged user's recent comments.
 */
export const commentDuplication: FraudRule = async (windowStart, windowEnd) => {
  // Pass 1: exact duplicates via contentHash
  const exact = await prisma.$queryRaw<
    Array<{ authorId: string; contentHash: string; posts: number; cnt: number }>
  >(Prisma.sql`
    SELECT c."authorId"                    AS "authorId",
           c."contentHash"                 AS "contentHash",
           COUNT(DISTINCT c."postId")::int AS "posts",
           COUNT(*)::int                   AS "cnt"
    FROM comments c
    WHERE c."createdAt" >= ${windowStart} AND c."createdAt" < ${windowEnd}
      AND c."contentHash" IS NOT NULL
    GROUP BY 1, 2
    HAVING COUNT(*) >= 3 AND COUNT(DISTINCT c."postId") >= 2
  `);

  const signals: SignalCandidate[] = exact.map((row) => ({
    userId: row.authorId,
    signalType: "comment_duplication",
    severity: "medium",
    evidence: {
      dedupeKey: `${row.authorId}:${row.contentHash}`,
      contentHash: row.contentHash,
      duplicateCount: row.cnt,
      distinctPosts: row.posts,
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
    },
  }));

  // Pass 2: sampled near-duplicate check for prolific commenters not already caught
  const flagged = new Set(exact.map((r) => r.authorId));
  const prolific = await prisma.comment.groupBy({
    by: ["authorId"],
    where: { createdAt: { gte: windowStart, lt: windowEnd } },
    _count: { _all: true },
    having: { authorId: { _count: { gte: 5 } } },
  });

  for (const { authorId } of prolific) {
    if (flagged.has(authorId)) continue;
    const comments = await prisma.comment.findMany({
      where: { authorId, createdAt: { gte: windowStart, lt: windowEnd } },
      select: { content: true, postId: true },
      orderBy: { createdAt: "desc" },
      take: SAMPLE_PER_USER,
    });

    let nearDups = 0;
    const dupPosts = new Set<string>();
    for (let i = 0; i < comments.length && nearDups < 3; i++) {
      for (let j = i + 1; j < comments.length; j++) {
        if (
          comments[i].postId !== comments[j].postId &&
          isNearDuplicate(comments[i].content, comments[j].content)
        ) {
          nearDups++;
          dupPosts.add(comments[i].postId);
          dupPosts.add(comments[j].postId);
          break;
        }
      }
    }
    if (nearDups >= 3) {
      signals.push({
        userId: authorId,
        signalType: "comment_duplication",
        severity: "medium",
        evidence: {
          dedupeKey: `${authorId}:near-dup`,
          nearDuplicatePairs: nearDups,
          distinctPosts: dupPosts.size,
          windowStart: windowStart.toISOString(),
          windowEnd: windowEnd.toISOString(),
        },
      });
    }
  }

  return signals;
};
