import Link from 'next/link';
import { formatDate, formatViews } from '@/lib/blog-utils';

interface HeroPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  views: number;
  createdAt: Date | string;
  category: { name: string; slug: string };
  author: { name: string | null; image?: string | null };
}

export default function HeroSection({ post }: { post: HeroPost }) {
  const href = `/article/${post.slug}`;

  return (
    <div className="relative w-full overflow-hidden bg-gray-900" style={{ minHeight: '420px' }}>
      {post.featuredImage
        ? <img src={post.featuredImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        : <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black" />
      }
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <div className="relative h-full flex items-end">
        <div className="max-w-[1300px] mx-auto w-full px-4 pb-10 pt-20">
          <div className="max-w-3xl">
            <Link href={`/category/${post.category.slug}`}
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 text-white bg-red-600 hover:bg-red-700 mb-3 rounded-sm">
              {post.category.name}
            </Link>
            <Link href={href}>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight hover:text-gray-200 transition-colors mb-3">
                {post.title}
              </h1>
            </Link>
            {post.excerpt && (
              <p className="text-gray-300 text-sm md:text-base line-clamp-2 mb-4 max-w-2xl">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                  {post.author.name?.[0] ?? 'A'}
                </div>
                <span className="font-semibold text-white">{post.author.name}</span>
              </div>
              <span>·</span>
              <span>{formatDate(post.createdAt)}</span>
              <span>·</span>
              <span>{formatViews(post.views)} views</span>
            </div>
          </div>
          <Link href={href}
            className="absolute bottom-10 right-4 md:right-10 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded hidden md:inline-block">
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
}
