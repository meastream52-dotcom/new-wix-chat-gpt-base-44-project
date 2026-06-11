import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { hashIp, hashUa } from "@/lib/hash";
import { DAILY_POINT_CAPS, type EngagementType } from "@/lib/engagement/constants";

export async function trackEngagement(
  userId: string,
  eventType: EngagementType,
  postId: string | null,
  points: number,
  req?: Request,
  metadata?: Record<string, unknown>
): Promise<void> {
  let awarded = points;

  const cap = DAILY_POINT_CAPS[eventType];
  if (cap !== undefined) {
    const countedToday = await prisma.engagementEvent.count({
      where: {
        userId,
        eventType,
        points: { gt: 0 },
        createdAt: { gte: startOfDay(new Date()) },
      },
    });
    if (countedToday >= cap) awarded = 0;
  }

  await prisma.engagementEvent.create({
    data: {
      userId,
      postId,
      eventType,
      points: awarded,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      ipHash: req ? hashIp(req) : null,
      userAgentHash: req ? hashUa(req) : null,
    },
  });
}
