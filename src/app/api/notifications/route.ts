import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const [notifications, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);
    return Response.json({ notifications, unread });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}

/** Mark all read. */
export async function POST() {
  try {
    const user = await requireUser();
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
