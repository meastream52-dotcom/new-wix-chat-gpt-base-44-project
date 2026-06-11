import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { shortDate } from "@/lib/format";
import { MarkdownView } from "@/components/MarkdownView";
import { ReadTracker } from "@/components/ReadTracker";
import { LikeButton } from "@/components/LikeButton";
import { CommentSection } from "@/components/CommentSection";
import { ReportButton } from "@/components/ReportButton";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, username: true, name: true, bio: true } },
      tags: { include: { tag: true } },
    },
  });

  const isAuthor = user?.id === post?.authorId;
  const visible =
    post &&
    post.status === "PUBLISHED" &&
    post.moderationStatus !== "REJECTED" &&
    (post.visibility !== "PRIVATE" || isAuthor);
  if (!post || (!visible && !isAuthor && user?.role !== "ADMIN")) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      {post.status !== "PUBLISHED" && (
        <p className="badge mb-4 bg-amber-100 text-amber-800">
          {post.status} — only you can see this
        </p>
      )}
      <article>
        <h1 className="text-4xl font-extrabold leading-tight">{post.title}</h1>
        <p className="mt-3 text-sm text-gray-500">
          By{" "}
          <Link href={`/u/${post.author.username}`} className="font-medium text-gray-700 hover:underline">
            {post.author.name ?? `@${post.author.username}`}
          </Link>{" "}
          · {shortDate(post.publishedAt)}
        </p>
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" className="mt-6 w-full rounded-xl object-cover" />
        )}
        <MarkdownView markdown={post.contentMarkdown} />
      </article>

      <div className="mt-8 flex items-center gap-3 border-y border-gray-200 py-3">
        <LikeButton postId={post.id} disabled={!user || isAuthor} />
        <div className="ml-auto flex items-center gap-3">
          {post.tags.map(({ tag }) => (
            <Link key={tag.id} href={`/?tag=${tag.slug}`} className="badge bg-gray-100 hover:bg-gray-200">
              {tag.name}
            </Link>
          ))}
          {user && !isAuthor && <ReportButton targetType="post" targetId={post.id} />}
          {isAuthor && (
            <Link href={`/write?edit=${post.id}`} className="btn-ghost">Edit</Link>
          )}
        </div>
      </div>

      {/* Tracks qualified reading time; self-reads are ignored server-side too */}
      {user && !isAuthor && <ReadTracker postId={post.id} />}

      <CommentSection postId={post.id} signedIn={!!user} />
    </div>
  );
}
