import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const createProjectSchema = z.object({
  prompt: z.string().min(10).max(5000),
  name: z.string().min(1).max(100).optional(),
  techStack: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { files: true, agentRuns: true, approvals: true } } },
  });

  return NextResponse.json({ data: projects });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { prompt, name, techStack } = createProjectSchema.parse(body);

    const derivedName = name ?? prompt.slice(0, 50).replace(/[^a-zA-Z0-9 ]/g, "").trim();

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name: derivedName,
        prompt,
        techStack: techStack ? (techStack as unknown as object) : undefined,
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
