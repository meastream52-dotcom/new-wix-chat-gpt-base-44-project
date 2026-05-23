import Link from 'next/link';
import { formatDate, formatViews } from '@/lib/blog-utils';

interface Post {
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

export default function ArticleCard({ post, size = 'default' }: { post: Post; size?: 'default' | 'large' | 'small' }) {
  const href = `/article/${post.slug}`;

  if (size === 'small') {
    return (
      <div className="flex gap-3 p-3 hover:bg-gray-50 transition-colors">
        {post.featuredImage && (
          <Link href={href} className="flex-shrink-0">
            <img src={post.featuredImage} alt={post.title} className="w-20 h-14 object-cover rounded" />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <Link href={`/category/${post.category.slug}`} className="text-xs font-bold uppercase text-red-600 hover:underline">
            {post.category.name}
          </Link>
          <Link href={href}>
            <h3 className="text-sm font-bold text-gray-900 leading-snug hover:text-red-600 transition-colors line-clamp-2 mt-0.5">{post.title}</h3>
          </Link>
          <p className="text-xs text-gray-500 mt-1">{formatDate(post.createdAt)}</p>
        </div>
      </div>
    );
  }

  if (size === 'large') {
    return (
      <div className="bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {post.featuredImage && (
          <Link href={href} className="block overflow-hidden">
            <img src={post.featuredImage} alt={post.title} className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-300" />
          </Link>
        )}
        <div className="p-4">
          <Link href={`/category/${post.category.slug}`} className="text-xs font-bold uppercase text-red-600 hover:underline tracking-wide">
            {post.category.name}
          </Link>
          <Link href={href}>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight hover:text-red-600 transition-colors mt-1 mb-2">{post.title}</h2>
          </Link>
          {post.excerpt && <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">{post.excerpt}</p>}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">By {post.author.name}</span>
            <span>·</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>·</span>
            <span>{formatViews(post.views)} views</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {post.featuredImage && (
        <Link href={href} className="block overflow-hidden">
          <img src={post.featuredImage} alt={post.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300" />
        </Link>
      )}
      <div className="p-4">
        <Link href={`/category/${post.category.slug}`} className="text-xs font-bold uppercase text-red-600 hover:underline tracking-wide">
          {post.category.name}
        </Link>
        <Link href={href}>
          <h3 className="text-base font-bold text-gray-900 leading-snug hover:text-red-600 transition-colors mt-1 mb-2 line-clamp-2">{post.title}</h3>
        </Link>
        {post.excerpt && <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium text-gray-600">By {post.author.name}</span>
          <span>·</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
