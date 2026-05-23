import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/blog/ArticleCard';
import AdBanner from '@/components/blog/AdBanner';
import BlogSidebar from '@/components/blog/BlogSidebar';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 12;

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1'));
  const skip = (page - 1) * PAGE_SIZE;

  const category = await db.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const [posts, total, trending] = await Promise.all([
    db.post.findMany({
      where: { published: true, categoryId: category.id },
      include: { category: true, author: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    db.post.count({ where: { published: true, categoryId: category.id } }),
    db.post.findMany({
      where: { published: true },
      include: { category: true, author: { select: { id: true, name: true, image: true } } },
      orderBy: { views: 'desc' },
      take: 8,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <div className="bg-black text-white py-10 px-4 border-b-4 border-red-600">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex items-center gap-2 text-sm mb-2 opacity-60">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>{category.name}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">{category.name}</h1>
          {category.description && <p className="text-gray-400 mt-2 max-w-2xl">{category.description}</p>}
          <p className="text-sm text-gray-500 mt-2">{total} articles</p>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 py-8 flex gap-8">
        <main className="flex-1 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((p) => <ArticleCard key={p.id} post={p} />)}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl font-bold mb-2">No articles yet</p>
              <p className="text-sm">Check back soon for the latest {category.name} news.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <Link href={`/category/${slug}?page=${page - 1}`} className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-semibold hover:bg-gray-50">← Previous</Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`/category/${slug}?page=${p}`}
                  className={`px-4 py-2 rounded text-sm font-semibold ${p === page ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link href={`/category/${slug}?page=${page + 1}`} className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-semibold hover:bg-gray-50">Next →</Link>
              )}
            </div>
          )}

          <div className="mt-8"><AdBanner placement="leaderboard" /></div>
        </main>

        <aside className="w-72 flex-shrink-0 hidden lg:block">
          <div className="sticky top-4"><BlogSidebar trending={trending} /></div>
        </aside>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} News & Reviews | CinemaRant`,
    description: category.description || `Latest ${category.name} news on CinemaRant.`,
  };
}
