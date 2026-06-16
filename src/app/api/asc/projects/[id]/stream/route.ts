import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { AscOrchestrator } from "@/agents/asc/orchestrator";
import type { SseEvent } from "@/lib/asc-types";

type DoneEvent = { type: "done" };
type StreamEvent = SseEvent | DoneEvent;

export const runtime = "nodejs";
export const maxDuration = 300;

function encodeSSE(event: SseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await db.ascProject.findUnique({ where: { id } });
  if (!project) {
    return new Response("Project not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SseEvent) => {
        try {
          controller.enqueue(encoder.encode(encodeSSE(event)));
        } catch {
          // Client disconnected
        }
      };

      send({
        type: "pipeline_start",
        agentRole: "ORCHESTRATOR",
        data: `Initializing pipeline for "${project.name}"`,
        timestamp: new Date().toISOString(),
      });

      const orchestrator = new AscOrchestrator();
      orchestrator.setEmitter(send);

      try {
        await orchestrator.run(id);
      } catch (err) {
        send({
          type: "pipeline_error",
          agentRole: "ORCHESTRATOR",
          data: err instanceof Error ? err.message : "Unknown error",
          timestamp: new Date().toISOString(),
        });
      }

      // Send done sentinel
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      } catch {
        // Already closed
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
