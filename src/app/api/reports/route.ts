import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";

const schema = z.object({
  targetType: z.enum(["post", "comment"]),
  targetId: z.string(),
  reason: z.string().min(3).max(1000),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!(await rateLimit(`report:${user.id}`, 10, 3600))) {
      return Response.json({ error: "Slow down." }, { status: 429 });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { targetType, targetId, reason } = parsed.data;

    const exists =
      targetType === "post"
        ? await prisma.post.findUnique({ where: { id: targetId } })
        : await prisma.comment.findUnique({ where: { id: targetId } });
    if (!exists) return new Response("Not found", { status: 404 });

    const report = await prisma.report.create({
      data: { reporterId: user.id, targetType, targetId, reason },
    });
    return Response.json({ ok: true, id: report.id });
  } catch (err) {
    return authErrorResponse(err) ?? new Response("Server error", { status: 500 });
  }
}
