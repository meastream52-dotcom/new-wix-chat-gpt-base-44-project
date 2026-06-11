import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/PostCard";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      posts: {
        where: {
          status: "PUBLISHED",
          visibility: "PUBLIC",
          moderationStatus: { in: ["APPROVED", "PENDING"] },
        },
        include: {
          author: { select: { username: true, name: true, avatar: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true, reactions: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 30,
      },
    },
  });
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
          {(user.name ?? user.username)[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold">{user.name ?? `@${user.username}`}</h1>
          <p className="text-sm text-gray-500">@{user.username}</p>
          {user.bio && <p className="mt-1 text-sm text-gray-600">{user.bio}</p>}
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {user.posts.length === 0 && (
          <p className="text-center text-sm text-gray-500">No published stories yet.</p>
        )}
        {user.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
