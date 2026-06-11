import Link from "next/link";
import { shortDate } from "@/lib/format";

export interface PostCardData {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | string | null;
  author: { username: string; name: string | null; avatar: string | null };
  tags: Array<{ tag: { name: string; slug: string } }>;
  _count: { comments: number; reactions: number };
}

export function PostCard({ post }: { post: PostCardData }) {
  return (
    <article className="card flex gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">
          <Link href={`/u/${post.author.username}`} className="font-medium text-gray-700 hover:underline">
            {post.author.name ?? `@${post.author.username}`}
          </Link>{" "}
          · {shortDate(post.publishedAt)}
        </p>
        <Link href={`/posts/${post.slug}`}>
          <h2 className="mt-1 text-lg font-bold leading-snug hover:underline">{post.title}</h2>
        </Link>
        {post.excerpt && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{post.excerpt}</p>}
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
          {post.tags.slice(0, 3).map(({ tag }) => (
            <Link key={tag.slug} href={`/?tag=${tag.slug}`} className="badge bg-gray-100 hover:bg-gray-200">
              {tag.name}
            </Link>
          ))}
          <span>👏 {post._count.reactions}</span>
          <span>💬 {post._count.comments}</span>
        </div>
      </div>
      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          className="hidden h-24 w-32 shrink-0 rounded-lg object-cover sm:block"
        />
      )}
    </article>
  );
}
