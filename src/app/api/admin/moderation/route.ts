import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("post_moderate"),
    postId: z.string(),
    status: z.enum(["APPROVED", "REJECTED", "FLAGGED"]),
  }),
  z.object({
    action: z.literal("report_resolve"),
    reportId: z.string(),
    outcome: z.enum(["upheld", "dismissed"]),
  }),
  z.object({
    action: z.literal("user_flag"),
    userId: z.string(),
    flagged: z.boolean(),
  }),
  z.object({
    action: z.literal("user_role"),
    userId: z.string(),
    role: z.enum(["USER", "MODERATOR", "ADMIN"]),
  }),
]);

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const body = parsed.data;

    switch (body.action) {
      case "post_moderate": {
        const post = await prisma.post.update({
          where: { id: body.postId },
          data: { moderationStatus: body.status },
        });
        await logAudit(admin.id, `moderation.post_${body.status.toLowerCase()}`, "post", post.id);
        if (body.status !== "APPROVED") {
          await notify(
            post.authorId,
            "content_flagged",
            `Your post "${post.title}" was ${body.status === "REJECTED" ? "rejected" : "flagged"} by moderation.`,
            `/posts/${post.slug}`
          );
        }
        break;
      }
      case "report_resolve": {
        const report = await prisma.report.update({
          where: { id: body.reportId },
          data: { status: body.outcome },
        });
        if (body.outcome === "upheld") {
          // Hide the reported content; uphold against comment authors feeds
          // the 3-strikes auto-flag in the comment spam gate
          if (report.targetType === "comment") {
            const comment = await prisma.comment.update({
              where: { id: report.targetId },
              data: { status: "hidden" },
            });
            await prisma.report.create({
              data: {
                reporterId: admin.id,
                targetType: "comment_author",
                targetId: comment.authorId,
                reason: `Upheld report ${report.id}`,
                status: "upheld",
              },
            });
            await notify(
              comment.authorId,
              "report_outcome",
              "One of your comments was removed after review.",
              undefined
            );
          } else if (report.targetType === "post") {
            await prisma.post.update({
              where: { id: report.targetId },
              data: { moderationStatus: "FLAGGED" },
            });
          }
        }
        await notify(
          report.reporterId,
          "report_outcome",
          body.outcome === "upheld"
            ? "Thanks — your report was reviewed and upheld."
            : "Your report was reviewed; no action was taken.",
          undefined
        );
        await logAudit(admin.id, `moderation.report_${body.outcome}`, "report", report.id);
        break;
      }
      case "user_flag": {
        await prisma.user.update({
          where: { id: body.userId },
          data: { isFlagged: body.flagged },
        });
        await logAudit(
          admin.id,
          body.flagged ? "user.flag" : "user.unflag",
          "user",
          body.userId
        );
        break;
      }
      case "user_role": {
        if (admin.role !== "ADMIN") return new Response("Forbidden", { status: 403 });
        await prisma.user.update({
          where: { id: body.userId },
          data: { role: body.role },
        });
        await logAudit(admin.id, "user.role_change", "user", body.userId, {
          role: body.role,
        });
        break;
      }
    }

    return Response.json({ ok: true });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
