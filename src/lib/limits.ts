import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

export const FREE_POSTS_PER_DAY = 2;

/**
 * The 2 posts/day free-tier limit. The database is the source of truth here —
 * Redis rate limiting is only an abuse-protection assist, never the gate on
 * this business rule.
 */
export async function canUserPost(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });
  if (!user) return false;

  const isActive =
    user.subscription?.status === "active" ||
    user.subscription?.status === "trialing";
  if (isActive) return true;

  const count = await prisma.post.count({
    where: {
      authorId: userId,
      createdAt: { gte: startOfDay(new Date()) },
      status: { not: "DELETED" },
    },
  });
  return count < FREE_POSTS_PER_DAY;
}
