import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const afterParam = url.searchParams.get("after");
  const after = afterParam ? new Date(afterParam) : new Date(Date.now() - 60 * 60 * 1000);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastSeen = after;
      let running = true;
      let pollCount = 0;
      const maxPolls = 300;

      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      send(JSON.stringify({ type: "connected", projectId: id }));

      while (running && pollCount < maxPolls) {
        await new Promise((r) => setTimeout(r, 1000));
        pollCount++;

        try {
          const logs = await prisma.agentLog.findMany({
            where: { projectId: id, createdAt: { gt: lastSeen } },
            orderBy: { createdAt: "asc" },
            take: 50,
          });

          for (const log of logs) {
            send(JSON.stringify({ type: "log", ...log, createdAt: log.createdAt.toISOString() }));
            lastSeen = log.createdAt;
          }

          const proj = await prisma.project.findUnique({ where: { id }, select: { status: true } });
          if (proj?.status === "REVIEW" || proj?.status === "DEPLOYED" || proj?.status === "FAILED") {
            send(JSON.stringify({ type: "done", status: proj.status }));
            running = false;
          }
        } catch {
          running = false;
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
