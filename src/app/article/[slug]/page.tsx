import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { formatDate, formatViews } from '@/lib/blog-utils';
import BlogSidebar from '@/components/blog/BlogSidebar';
import AdBanner from '@/components/blog/AdBanner';
import ArticleCard from '@/components/blog/ArticleCard';
import Link from 'next/link';

interface Props { params: Promise<{ slug: string }> }

async function getPost(slug: string) {
  const post = await db.post.findUnique({
    where: { slug, published: true },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
      tags: true,
    },
  });
  if (post) {
    db.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {});
  }
  return post;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [post, trending] = await Promise.all([
    getPost(slug),
    db.post.findMany({
      where: { published: true },
      include: { category: true, author: { select: { id: true, name: true, image: true } } },
      orderBy: { views: 'desc' },
      take: 8,
    }),
  ]);
  if (!post) notFound();

  const related = await db.post.findMany({
    where: { published: true, categoryId: post.categoryId, NOT: { id: post.id } },
    include: { category: true, author: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1300px] mx-auto px-4 py-2 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <span>/</span>
          <Link href={`/category/${post.category.slug}`} className="hover:text-red-600">{post.category.name}</Link>
          <span>/</span>
          <span className="text-gray-400 truncate max-w-xs">{post.title}</span>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 py-8 flex gap-8">
        <article className="flex-1 min-w-0">
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 pb-0">
              <Link href={`/category/${post.category.slug}`}
                className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm text-white bg-red-600 mb-4 hover:bg-red-700">
                {post.category.name}
              </Link>

              <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-4">{post.title}</h1>

              {post.excerpt && (
                <p className="text-lg text-gray-600 font-medium leading-relaxed mb-4 border-l-4 border-red-600 pl-4">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center flex-wrap gap-4 py-4 border-t border-b border-gray-100 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold text-white">
                    {post.author.name?.[0] ?? 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">By {post.author.name}</p>
                    <p className="text-xs text-gray-500">Staff Writer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 ml-auto flex-wrap">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>·</span>
                  <span>{formatViews(post.views)} views</span>
                  {post.premium && <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded">PREMIUM</span>}
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="bg-black text-white text-xs px-2.5 py-1.5 rounded hover:bg-gray-800">
                    𝕏 Share
                  </a>
                </div>
              </div>
            </div>

            {post.featuredImage && (
              <div className="px-6 md:px-8 mb-6">
                <img src={post.featuredImage} alt={post.title} className="w-full rounded-lg object-cover max-h-[480px]" />
              </div>
            )}

            <div className="px-6 md:px-8"><AdBanner placement="in-article" /></div>

            <div className="article-content px-6 md:px-8 py-4" dangerouslySetInnerHTML={{ __html: post.content }} />

            <div className="px-6 md:px-8 pb-4"><AdBanner placement="in-article" /></div>

            {post.tags.length > 0 && (
              <div className="px-6 md:px-8 py-4 border-t border-gray-100 flex flex-wrap gap-2 items-center">
                <span className="text-sm font-bold text-gray-700">Tags:</span>
                {post.tags.map((tag) => (
                  <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{tag.name}</span>
                ))}
              </div>
            )}

            <div className="px-6 md:px-8 py-6 bg-gray-50 border-t border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-xl font-black text-white flex-shrink-0">
                  {post.author.name?.[0] ?? 'A'}
                </div>
                <div>
                  <p className="font-black text-gray-900">{post.author.name}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Staff Writer · CinemaRant</p>
                  <p className="text-sm text-gray-500">{post.author.name} is a staff writer covering the latest in entertainment news.</p>
                </div>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black uppercase tracking-wide border-l-4 border-red-600 pl-3">More in {post.category.name}</h2>
                <Link href={`/category/${post.category.slug}`} className="text-sm text-red-600 font-semibold hover:underline">See All →</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map((p) => <ArticleCard key={p.id} post={p} />)}
              </div>
            </section>
          )}
        </article>

        <aside className="w-72 flex-shrink-0 hidden lg:block">
          <div className="sticky top-4"><BlogSidebar trending={trending} /></div>
        </aside>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug }, include: { category: true } });
  if (!post) return { title: 'Not Found' };
  return {
    title: `${post.title} | CinemaRant`,
    description: post.excerpt || post.title,
    openGraph: { images: post.featuredImage ? [post.featuredImage] : [] },
  };
}
