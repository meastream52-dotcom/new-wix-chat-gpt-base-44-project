import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const CreateProjectSchema = z.object({
  description: z.string().min(10).max(2000),
  customerId: z.string().optional(),
});

export async function GET() {
  try {
    const projects = await db.ascProject.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { tasks: true, artifacts: true } },
        costEntries: { select: { cost: true } },
      },
    });

    const data = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      customerId: p.customerId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      taskCount: p._count.tasks,
      artifactCount: p._count.artifacts,
      totalCost: p.costEntries.reduce((sum: number, e: { cost: number }) => sum + e.cost, 0),
    }));

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { description, customerId = "anonymous" } = parsed.data;

    // Generate a name from description
    const words = description.trim().split(/\s+/);
    const name = words.slice(0, 6).join(" ").replace(/[^a-zA-Z0-9\s]/g, "").trim() || "New Project";

    const project = await db.ascProject.create({
      data: { name, description, customerId, status: "INITIALIZING" },
    });

    await db.ascMessage.create({
      data: {
        projectId: project.id,
        fromAgentRole: "ORCHESTRATOR",
        content: `Project created: "${project.name}"`,
        type: "INFO",
      },
    });

    return NextResponse.json({ data: { ...project, createdAt: project.createdAt.toISOString(), updatedAt: project.updatedAt.toISOString() } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
