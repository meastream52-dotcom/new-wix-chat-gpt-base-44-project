import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { runOrchestrator } from "@/agents/orchestrator";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (project.status === "BUILDING" || project.status === "PLANNING") {
    return NextResponse.json({ error: "Pipeline already running" }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const mode = (body.mode as "full" | "frontend-only" | "backend-only" | "spec-only") ?? "full";

  runOrchestrator({ projectId: id, mode }).catch(async (err) => {
    await prisma.agentLog.create({
      data: { projectId: id, level: "ERROR", message: `Pipeline crashed: ${err instanceof Error ? err.message : String(err)}` },
    });
    await prisma.project.update({ where: { id }, data: { status: "FAILED" } });
  });

  return NextResponse.json({ data: { started: true, projectId: id } }, { status: 202 });
}
