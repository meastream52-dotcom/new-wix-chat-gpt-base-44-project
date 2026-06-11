import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id: postId } = await params;
  const user = await getCurrentUser();
  const [count, mine] = await Promise.all([
    prisma.reaction.count({ where: { postId } }),
    user
      ? prisma.reaction.findUnique({
          where: { userId_postId: { userId: user.id, postId } },
        })
      : null,
  ]);
  return Response.json({ liked: !!mine, count });
}
