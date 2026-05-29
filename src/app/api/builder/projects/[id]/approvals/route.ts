import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const approvals = await prisma.approval.findMany({
    where: { projectId: id },
    orderBy: { requestedAt: "desc" },
  });

  return NextResponse.json({ data: approvals });
}

const resolveSchema = z.object({
  approvalId: z.string().cuid(),
  decision: z.enum(["APPROVED", "REJECTED"]),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const { approvalId, decision } = resolveSchema.parse(body);

    const approval = await prisma.approval.findFirst({ where: { id: approvalId, projectId: id } });
    if (!approval) return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    if (approval.status !== "PENDING") return NextResponse.json({ error: "Already resolved" }, { status: 409 });

    const updated = await prisma.approval.update({
      where: { id: approvalId },
      data: { status: decision, resolvedAt: new Date() },
    });

    await prisma.agentLog.create({
      data: { projectId: id, level: decision === "APPROVED" ? "SUCCESS" : "WARNING", message: `${decision}: ${approval.description}` },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to resolve approval" }, { status: 500 });
  }
}
