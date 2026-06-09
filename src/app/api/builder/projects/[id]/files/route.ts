import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(request.url);
  const filePath = url.searchParams.get("path");

  if (filePath) {
    const file = await prisma.generatedFile.findUnique({ where: { projectId_path: { projectId: id, path: filePath } } });
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });
    return NextResponse.json({ data: file });
  }

  const files = await prisma.generatedFile.findMany({
    where: { projectId: id },
    orderBy: { path: "asc" },
    select: { id: true, path: true, language: true, version: true, agentType: true, updatedAt: true },
  });

  return NextResponse.json({ data: files });
}
