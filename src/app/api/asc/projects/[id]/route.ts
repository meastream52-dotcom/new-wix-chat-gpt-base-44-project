import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await db.ascProject.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { createdAt: "asc" } },
        artifacts: { orderBy: { createdAt: "asc" } },
        deployments: { orderBy: { createdAt: "desc" } },
        messages: { orderBy: { timestamp: "asc" } },
        costEntries: { orderBy: { timestamp: "asc" } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const totalCost = project.costEntries.reduce((s: number, e: { cost: number }) => s + e.cost, 0);
    const totalTokens = project.costEntries.reduce((s: number, e: { tokens: number }) => s + e.tokens, 0);

    return NextResponse.json({
      data: {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        tasks: project.tasks.map((t: typeof project.tasks[0]) => ({
          ...t,
          startedAt: t.startedAt?.toISOString() ?? null,
          completedAt: t.completedAt?.toISOString() ?? null,
          createdAt: t.createdAt.toISOString(),
        })),
        artifacts: project.artifacts.map((a: typeof project.artifacts[0]) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
        })),
        deployments: project.deployments.map((d: typeof project.deployments[0]) => ({
          ...d,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        })),
        messages: project.messages.map((m: typeof project.messages[0]) => ({
          ...m,
          timestamp: m.timestamp.toISOString(),
        })),
        costEntries: project.costEntries.map((c: typeof project.costEntries[0]) => ({
          ...c,
          timestamp: c.timestamp.toISOString(),
        })),
        totalCost,
        totalTokens,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.ascProject.delete({ where: { id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
