import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/PostCard";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;

  const [posts, tags] = await Promise.all([
    prisma.post.findMany({
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
      take: 30,
    }),
    prisma.tag.findMany({ where: { status: "active" }, orderBy: { name: "asc" }, take: 20 }),
  ]);

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_240px]">
      <div className="space-y-4">
        {tag && (
          <p className="text-sm text-gray-600">
            Stories tagged <span className="font-semibold">#{tag}</span> —{" "}
            <Link href="/" className="underline">clear</Link>
          </p>
        )}
        {posts.length === 0 && (
          <div className="card text-center text-gray-500">
            No stories yet. <Link href="/write" className="text-accent underline">Write the first one.</Link>
          </div>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <aside className="hidden md:block">
        <h3 className="text-sm font-semibold text-gray-700">Topics</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link key={t.id} href={`/?tag=${t.slug}`} className="badge bg-gray-100 hover:bg-gray-200">
              {t.name}
            </Link>
          ))}
        </div>
        <div className="card mt-6 text-sm">
          <p className="font-semibold">Earn by writing & reading</p>
          <p className="mt-1 text-gray-600">
            40% of subscription revenue goes to writers, 10% to active readers.
          </p>
          <Link href="/earnings-policy" className="mt-2 inline-block text-accent underline">
            How it works
          </Link>
        </div>
      </aside>
    </div>
  );
}
