import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { trackEngagement } from "@/lib/engagement/track";
import { POINTS } from "@/lib/engagement/constants";
import { rateLimit } from "@/lib/ratelimit";

type Params = { params: Promise<{ id: string }> };

/**
 * Toggle a like. The engagement event is recorded for the LIKER at 0 points
 * — likes pay the receiver, and the receiver's benefit is computed at
 * distribution time from unique likers in the Reactions table.
 */
export async function POST(req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id: postId } = await params;

    if (!(await rateLimit(`react:${user.id}`, 60, 600))) {
      return Response.json({ error: "Slow down." }, { status: 429 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.status !== "PUBLISHED") {
      return new Response("Not found", { status: 404 });
    }
    if (post.authorId === user.id) {
      return Response.json({ error: "You can't like your own post" }, { status: 400 });
    }

    const existing = await prisma.reaction.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });

    let liked: boolean;
    if (existing) {
      // Un-like: the row goes, the historical event stays — distribution
      // reads the Reactions table, not events, for like counts
      await prisma.reaction.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      try {
        await prisma.reaction.create({ data: { userId: user.id, postId } });
        await trackEngagement(user.id, "reaction_created", postId, POINTS.reaction_created, req);
      } catch (err) {
        // Unique violation under race (spam-click) — treat as already liked
        if (
          !(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")
        ) {
          throw err;
        }
      }
      liked = true;
    }

    const count = await prisma.reaction.count({ where: { postId } });
    return Response.json({ liked, count });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
