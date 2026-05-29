import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const project = await db.ascProject.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status === "RUNNING") {
      return NextResponse.json({ error: "Pipeline already running" }, { status: 409 });
    }

    // Reset to INITIALIZING so stream endpoint can pick up
    await db.ascProject.update({
      where: { id },
      data: { status: "INITIALIZING" },
    });

    return NextResponse.json({ data: { projectId: id, started: true } });
  } catch {
    return NextResponse.json({ error: "Failed to start pipeline" }, { status: 500 });
  }
}
