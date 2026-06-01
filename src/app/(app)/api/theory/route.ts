import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scoreTheory } from "@/agents/theoryScorer";
import { TheoryNode } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { title, description, nodes } = await req.json() as {
      title: string;
      description: string;
      nodes: TheoryNode[];
    };

    if (!title || !nodes || nodes.length === 0) {
      return NextResponse.json({ error: "title and nodes are required" }, { status: 400 });
    }

    const theory = await prisma.theory.create({
      data: {
        title,
        description: description ?? "",
        claimIds: nodes.map((n) => n.claimId),
      },
    });

    const result = await scoreTheory(theory.id, nodes);

    return NextResponse.json({ theory: { ...theory, score: result.score }, result });
  } catch (err) {
    console.error("[theory POST]", err);
    return NextResponse.json({ error: "theory creation failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const theory = await prisma.theory.findUnique({ where: { id } });
    if (!theory) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ theory });
  }

  const theories = await prisma.theory.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ theories });
}

export async function PUT(req: NextRequest) {
  try {
    const { id, nodes } = await req.json() as { id: string; nodes: TheoryNode[] };

    if (!id || !nodes) {
      return NextResponse.json({ error: "id and nodes are required" }, { status: 400 });
    }

    const result = await scoreTheory(id, nodes);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("[theory PUT]", err);
    return NextResponse.json({ error: "rescoring failed" }, { status: 500 });
  }
}
