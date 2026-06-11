import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { trackEngagement } from "@/lib/engagement/track";
import { POINTS } from "@/lib/engagement/constants";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  contentMarkdown: z.string().min(1).max(100_000).optional(),
  excerpt: z.string().max(500).nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  publish: z.boolean().optional(),
  archive: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post || post.status === "DELETED") return new Response("Not found", { status: 404 });
    if (post.authorId !== user.id && user.role !== "ADMIN") {
      return new Response("Forbidden", { status: 403 });
    }

    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { publish, archive, ...fields } = parsed.data;

    const firstPublish = publish && post.status === "DRAFT";
    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...fields,
        ...(publish
          ? { status: "PUBLISHED", publishedAt: post.publishedAt ?? new Date() }
          : {}),
        ...(archive ? { status: "ARCHIVED" } : {}),
      },
    });

    if (firstPublish) {
      await trackEngagement(user.id, "post_published", post.id, POINTS.post_published, req);
    }

    return Response.json(updated);
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post || post.status === "DELETED") return new Response("Not found", { status: 404 });
    if (post.authorId !== user.id && user.role !== "ADMIN") {
      return new Response("Forbidden", { status: 403 });
    }

    // Soft delete — sessions/events stay for the audit trail; the status
    // excludes the post from every score going forward
    await prisma.post.update({ where: { id }, data: { status: "DELETED" } });
    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
