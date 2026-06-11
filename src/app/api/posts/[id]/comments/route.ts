import { z } from "zod";
import { differenceInDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { trackEngagement } from "@/lib/engagement/track";
import { POINTS } from "@/lib/engagement/constants";
import { rateLimit } from "@/lib/ratelimit";
import { getConfig } from "@/lib/config";
import { checkLinkDensity, contentHash, matchesBannedPattern } from "@/lib/moderation/spam";
import { notify } from "@/lib/notify";

const schema = z.object({
  content: z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id: postId } = await params;

    if (!(await rateLimit(`comment:${user.id}`, 20, 600))) {
      return Response.json({ error: "Slow down." }, { status: 429 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.status !== "PUBLISHED") {
      return new Response("Not found", { status: 404 });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { content, parentId } = parsed.data;

    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent || parent.postId !== postId) {
        return Response.json({ error: "Invalid parent comment" }, { status: 400 });
      }
    }

    // Write-time spam gate
    const accountAgeDays = differenceInDays(new Date(), user.createdAt);
    const linkVerdict = checkLinkDensity(content, accountAgeDays);
    if (linkVerdict.spam) {
      return Response.json({ error: linkVerdict.reason }, { status: 422 });
    }
    const bannedPatterns = await getConfig<string[]>("banned_comment_patterns");
    const banned = matchesBannedPattern(content, bannedPatterns ?? []);

    // 3+ upheld spam reports → future comments auto-flag into the mod queue
    const upheldReports = await prisma.report.count({
      where: { targetType: "comment_author", targetId: user.id, status: "upheld" },
    });
    const autoFlag = banned || upheldReports >= 3;

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: user.id,
        parentId,
        content,
        contentHash: contentHash(content),
        status: autoFlag ? "flagged" : "visible",
      },
      include: { author: { select: { username: true, name: true, avatar: true } } },
    });

    if (autoFlag) {
      await notify(
        user.id,
        "content_flagged",
        "Your comment is awaiting moderator review before it appears.",
        `/posts/${post.slug}`
      );
    } else if (post.authorId !== user.id) {
      // No points for commenting on your own post
      await trackEngagement(user.id, "comment_created", postId, POINTS.comment_created, req);
    }

    return Response.json(comment);
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}

export async function GET(_req: Request, { params }: Params) {
  const { id: postId } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId, status: "visible" },
    include: { author: { select: { username: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });
  return Response.json({ comments });
}
