import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "entry_approved"
  | "payout_sent"
  | "payout_held"
  | "content_flagged"
  | "report_outcome";

export async function notify(
  userId: string,
  type: NotificationType,
  body: string,
  href?: string
): Promise<void> {
  await prisma.notification.create({ data: { userId, type, body, href } });
}
