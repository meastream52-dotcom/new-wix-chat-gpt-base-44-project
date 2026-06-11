import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { baseSlug } from "@/lib/slugify";
import { rateLimit } from "@/lib/ratelimit";

export async function GET() {
  const tags = await prisma.tag.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    take: 200,
  });
  return Response.json({ tags });
}

const schema = z.object({ name: z.string().min(2).max(40) });

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!(await rateLimit(`tag:${user.id}`, 10, 3600))) {
      return Response.json({ error: "Slow down." }, { status: 429 });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const slug = baseSlug(parsed.data.name);
    // Duplicate-protected: same slug returns the existing tag
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name: parsed.data.name.trim(), slug, creatorId: user.id },
      update: {},
    });
    return Response.json(tag);
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
