import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { canUserPost, FREE_POSTS_PER_DAY } from "@/lib/limits";
import { slugify } from "@/lib/slugify";
import { trackEngagement } from "@/lib/engagement/track";
import { POINTS } from "@/lib/engagement/constants";
import { rateLimit } from "@/lib/ratelimit";

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  contentMarkdown: z.string().min(1).max(100_000),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  tagIds: z.array(z.string()).max(5).optional(),
  publish: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    // Redis assist for burst abuse; the DB check below is the real gate
    if (!(await rateLimit(`post:${user.id}`, 10, 3600))) {
      return Response.json({ error: "Slow down." }, { status: 429 });
    }
    if (!(await canUserPost(user.id))) {
      return Response.json(
        {
          error: `Daily limit (${FREE_POSTS_PER_DAY}) reached. Upgrade to Premium for unlimited posts.`,
        },
        { status: 429 }
      );
    }

    const parsed = createPostSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { title, contentMarkdown, excerpt, coverImage, tagIds, publish } = parsed.data;

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        title,
        slug: await slugify(title),
        contentMarkdown,
        excerpt,
        coverImage,
        status: publish ? "PUBLISHED" : "DRAFT",
        publishedAt: publish ? new Date() : null,
        tags: { create: (tagIds ?? []).map((tagId) => ({ tagId })) },
      },
    });

    if (publish) {
      await trackEngagement(user.id, "post_published", post.id, POINTS.post_published, req);
    }

    return Response.json(post);
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const take = Math.min(parseInt(searchParams.get("take") ?? "20", 10) || 20, 50);
  const cursor = searchParams.get("cursor");

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      moderationStatus: { in: ["APPROVED", "PENDING"] },
      ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    },
    include: {
      author: { select: { username: true, name: true, avatar: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, reactions: true } },
    },
    orderBy: { publishedAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  return Response.json({
    posts,
    nextCursor: posts.length === take ? posts[posts.length - 1].id : null,
  });
}
